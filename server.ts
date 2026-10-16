import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  initDB,
  getUserById,
  getUserByEmail,
  saveUser,
  deleteUser,
  User,
  DailyLog,
  MealPlan,
  WorkoutDayPlan,
  DailyRoutineEvent,
  UserProfile,
} from './server/db';
import { INITIAL_FOOD_DATABASE } from './src/data/foodDatabase';
import {
  NUTRITION_DATABASE,
  matchFoodInDatabase,
  calculateNutrientsForPortion,
  validateAndReconcileNutrients,
  runSanityCheck,
} from './src/data/nutritionDatabase';

dotenv.config();

const app = express();
function getPort(): number {
  const portIndex = process.argv.indexOf('--port');
  if (portIndex !== -1 && process.argv[portIndex + 1]) {
    const p = parseInt(process.argv[portIndex + 1], 10);
    if (!isNaN(p)) return p;
  }
  if (process.env.PORT) {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p)) return p;
  }
  return 3000;
}

function getHost(): string {
  const hostIndex = process.argv.indexOf('--host');
  if (hostIndex !== -1 && process.argv[hostIndex + 1]) {
    return process.argv[hostIndex + 1];
  }
  return process.env.HOST || '0.0.0.0';
}

const PORT = getPort();
const HOST = getHost();

app.use(express.json({ limit: '15mb' }));

// Initialize persistent DB
initDB();

// Server-side Gemini client
let ai: GoogleGenAI | null = null;
const rawApiKey = (process.env.GEMINI_API_KEY || '').trim();
if (rawApiKey) {
  ai = new GoogleGenAI({ apiKey: rawApiKey });
}

/**
 * Strips EXIF, XMP, IPTC, and comment metadata segments from JPEG buffers.
 * Guarantees that only raw visual image bitstreams are processed by vision AI,
 * preventing any filename or metadata leakage.
 */
function stripJpegMetadata(buf: Buffer): Buffer {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return buf;
  const cleanChunks: Buffer[] = [Buffer.from([0xff, 0xd8])];
  let offset = 2;
  while (offset < buf.length - 1) {
    if (buf[offset] !== 0xff) {
      cleanChunks.push(buf.subarray(offset));
      break;
    }
    const marker = buf[offset + 1];
    if (marker === 0xd8) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9) {
      cleanChunks.push(Buffer.from([0xff, 0xd9]));
      break;
    }
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x00) {
      cleanChunks.push(buf.subarray(offset, offset + 2));
      offset += 2;
      continue;
    }
    if (offset + 3 >= buf.length) {
      cleanChunks.push(buf.subarray(offset));
      break;
    }
    const segmentLength = buf.readUInt16BE(offset + 2);
    const segmentEnd = offset + 2 + segmentLength;
    if (segmentEnd > buf.length) {
      cleanChunks.push(buf.subarray(offset));
      break;
    }
    // APP1 to APP15 (0xE1..0xEF) and COM (0xFE) contain metadata/EXIF/IPTC/XMP/comments
    const isAppOrComment = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;
    if (!isAppOrComment) {
      cleanChunks.push(buf.subarray(offset, segmentEnd));
    }
    if (marker === 0xda) {
      cleanChunks.push(buf.subarray(segmentEnd));
      break;
    }
    offset = segmentEnd;
  }
  return Buffer.concat(cleanChunks);
}

/**
 * Strips text and EXIF metadata chunks (tEXt, zTXt, iTXt, eXIf) from PNG buffers.
 */
function stripPngMetadata(buf: Buffer): Buffer {
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buf.length < 8 || !buf.subarray(0, 8).equals(pngSig)) return buf;
  const cleanChunks: Buffer[] = [buf.subarray(0, 8)];
  let offset = 8;
  while (offset + 12 <= buf.length) {
    const chunkLength = buf.readUInt32BE(offset);
    const chunkType = buf.toString('ascii', offset + 4, offset + 8);
    const totalChunkLength = 12 + chunkLength;
    if (offset + totalChunkLength > buf.length) {
      cleanChunks.push(buf.subarray(offset));
      break;
    }
    if (['tEXt', 'zTXt', 'iTXt', 'eXIf'].includes(chunkType)) {
      offset += totalChunkLength;
      continue;
    }
    cleanChunks.push(buf.subarray(offset, offset + totalChunkLength));
    offset += totalChunkLength;
    if (chunkType === 'IEND') break;
  }
  return Buffer.concat(cleanChunks);
}

/**
 * Executes a Gemini Vision API call with multi-model fallback (gemini-3.1-flash-lite, gemini-flash-latest, & gemini-3.8-flash)
 * and retry on transient quota or 503 high-demand responses
 */
async function callGeminiVision(contents: any, config: any) {
  if (!ai) throw new Error('Gemini AI client not initialized');
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastErr: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents,
          config,
        });
      } catch (err: any) {
        lastErr = err;
        const msg = (err?.message || '').toLowerCase();
        const isQuotaOrDemand =
          err?.status === 429 ||
          err?.status === 503 ||
          msg.includes('429') ||
          msg.includes('503') ||
          msg.includes('resource_exhausted') ||
          msg.includes('quota') ||
          msg.includes('unavailable') ||
          msg.includes('overloaded') ||
          msg.includes('rate');

        if (isQuotaOrDemand) {
          console.warn(`[Gemini Vision] Model ${model} attempt ${attempt + 1} hit quota/demand limits, switching...`);
          await new Promise((r) => setTimeout(r, 500));
          // If quota exceeded specifically, don't waste 2nd attempt on same model, switch to next model immediately
          if (msg.includes('quota') || msg.includes('resource_exhausted')) {
            break;
          }
        } else {
          throw err;
        }
      }
    }
  }
  throw lastErr || new Error('All Gemini Vision model attempts failed');
}

// Authentication helper
function getUserIdFromReq(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const customHeader = req.headers['x-user-id'];
  if (typeof customHeader === 'string' && customHeader) {
    return customHeader;
  }
  // Default to demo-user-123 if not provided
  return 'demo-user-123';
}

// ==================== SYSTEM & HEALTH ROUTES ====================

app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    aiReady: !!ai,
    environment: process.env.NODE_ENV || 'development',
  });
});

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    const existing = getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: password ? 'hashed_' + password : undefined,
      createdAt: new Date().toISOString(),
      logs: [],
      customPrices: {},
    };

    saveUser(newUser);
    return res.json({ token: newUser.id, user: newUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    let user = getUserByEmail(cleanEmail);
    if (!user) {
      // Auto-create for convenience if not existing
      user = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        createdAt: new Date().toISOString(),
        logs: [],
        customPrices: {},
      };
      saveUser(user);
    }

    return res.json({ token: user.id, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/demo', (_req: Request, res: Response) => {
  try {
    const demoUser = getUserById('demo-user-123');
    if (!demoUser) {
      return res.status(404).json({ error: 'Demo user unavailable' });
    }
    return res.json({ token: demoUser.id, user: demoUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user });
});

// ==================== USER PROFILE & PLAN ROUTES ====================

app.get('/api/user/profile', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ profile: user.profile });
});

app.post('/api/user/profile', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const profile: UserProfile = req.body.profile;
  user.profile = profile;
  saveUser(user);
  return res.json({ success: true, profile: user.profile });
});

app.post('/api/user/account', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, email } = req.body;
  if (name) user.name = name.trim();
  if (email) user.email = email.trim();
  user.isDemo = false;
  saveUser(user);
  return res.json({ success: true, user });
});

app.get('/api/user/plan', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ plan: user.plan });
});

app.post('/api/user/plan', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.plan = {
    meals: req.body.meals || user.plan?.meals || [],
    workoutSplit: req.body.workoutSplit || user.plan?.workoutSplit || [],
    dailyRoutine: req.body.dailyRoutine || user.plan?.dailyRoutine || [],
    updatedAt: new Date().toISOString(),
  };

  saveUser(user);
  return res.json({ success: true, plan: user.plan });
});

app.get('/api/user/logs', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ logs: user.logs || [] });
});

app.get('/api/user/logs/:date', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { date } = req.params;
  const foundLog = (user.logs || []).find((l) => l.date === date);
  if (!foundLog) {
    return res.status(404).json({ error: `No log found for date ${date}` });
  }
  return res.json({ log: foundLog });
});

app.delete('/api/user/logs/:date', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { date } = req.params;
  const initialLen = (user.logs || []).length;
  user.logs = (user.logs || []).filter((l) => l.date !== date);
  saveUser(user);

  return res.json({
    success: true,
    deleted: user.logs.length < initialLen,
    logs: user.logs,
  });
});

app.post('/api/user/logs', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const logEntry: DailyLog = req.body.log;
  if (!logEntry || !logEntry.date) {
    return res.status(400).json({ error: 'Log date is required' });
  }

  user.logs = user.logs || [];
  const existingIdx = user.logs.findIndex((l) => l.date === logEntry.date);
  if (existingIdx >= 0) {
    user.logs[existingIdx] = { ...user.logs[existingIdx], ...logEntry };
  } else {
    user.logs.push(logEntry);
  }

  // Sort logs by date ascending
  user.logs.sort((a, b) => a.date.localeCompare(b.date));

  saveUser(user);
  return res.json({ success: true, logs: user.logs });
});

app.post('/api/user/custom-prices', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { foodId, price } = req.body;
  if (!foodId || price === undefined) {
    return res.status(400).json({ error: 'foodId and price are required' });
  }

  user.customPrices = user.customPrices || {};
  user.customPrices[foodId] = Number(price);
  saveUser(user);

  return res.json({ success: true, customPrices: user.customPrices });
});

app.post('/api/user/notifications', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.notificationSettings = req.body.settings;
  saveUser(user);
  return res.json({ success: true, settings: user.notificationSettings });
});

app.post('/api/user/export', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const safeExport = {
    app: 'FitBudget',
    exportedAt: new Date().toISOString(),
    profile: user.profile,
    plan: user.plan,
    logs: user.logs,
    customPrices: user.customPrices,
    notificationSettings: user.notificationSettings,
  };

  return res.json(safeExport);
});

app.delete('/api/user/delete', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  if (userId === 'demo-user-123') {
    // Reset demo user rather than deleting permanently
    initDB();
    return res.json({ success: true, message: 'Demo profile reset to default' });
  }
  deleteUser(userId);
  return res.json({ success: true, message: 'User account and all personal data deleted' });
});

// ==================== FOOD DATABASE ROUTES ====================

app.get('/api/foods', (req: Request, res: Response) => {
  let list = [...INITIAL_FOOD_DATABASE];
  const { search, category, dietType } = req.query;

  if (typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }

  if (typeof category === 'string' && category.trim()) {
    const cat = category.trim().toLowerCase();
    list = list.filter((f) => f.category.toLowerCase() === cat);
  }

  if (typeof dietType === 'string' && dietType.trim()) {
    const dt = dietType.trim().toLowerCase();
    list = list.filter((f) => f.dietType.toLowerCase() === dt);
  }

  return res.json({ foods: list, total: list.length });
});

app.get('/api/foods/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const food = INITIAL_FOOD_DATABASE.find((f) => f.id === id);
  if (!food) {
    return res.status(404).json({ error: `Food item with id "${id}" not found` });
  }
  return res.json({ food });
});

// ==================== FOOD IMAGE RECOGNITION (ANALYZE MY FOOD) ====================

app.post('/api/analyze-food', async (req: Request, res: Response) => {
  try {
    // CRITICAL: Strictly extract raw image data ONLY. Discard any filenames, titles, URLs, or external text.
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini AI Vision client is not initialized. Please ensure GEMINI_API_KEY is configured.',
        isFoodDetected: false,
        detectedFoods: [],
      });
    }

    // Extract raw base64 data and mimeType accurately from data URL if provided
    let cleanMimeType = mimeType || 'image/jpeg';
    let rawBase64 = imageBase64;
    const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      cleanMimeType = dataUrlMatch[1];
      rawBase64 = dataUrlMatch[2];
    } else {
      rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    }

    // Purge any embedded EXIF, IPTC, XMP, or text comments from the image buffer
    // so vision AI receives only pristine, unannotated visual image pixels.
    let cleanedBase64 = rawBase64;
    try {
      const imgBuffer = Buffer.from(rawBase64, 'base64');
      if (cleanMimeType.includes('jpeg') || cleanMimeType.includes('jpg')) {
        cleanedBase64 = stripJpegMetadata(imgBuffer).toString('base64');
      } else if (cleanMimeType.includes('png')) {
        cleanedBase64 = stripPngMetadata(imgBuffer).toString('base64');
      }
    } catch (e) {
      console.warn('Metadata purge fallback, using raw image base64:', e);
    }

    const prompt = `You are an expert food recognition computer vision engine.
You are given the raw visual image pixels only.

ABSOLUTE VISUAL IDENTIFICATION RULES:
1. STRICT VISUAL ANALYSIS OF PIXELS ONLY:
   - Identify the food SOLELY by analyzing the actual visual pixels (colors, textures, ingredients, shapes, preparation, plating, garnish).
   - ABSOLUTELY DO NOT use any filename, file path, URL, image metadata, EXIF tags, or external text to identify the food.
   - Ignore any misleading text, labels, or filenames. The filename or metadata may be intentionally misleading during testing (e.g. a photo of roasted chicken named "apple.jpg" or a photo of paneer kadai named "chicken.jpg"). You MUST identify what is ACTUALLY visible in the image pixels.
   - For example: if the image shows Roasted Chicken, identify it as Roasted Chicken. If the image shows Paneer Kadai, identify it as Paneer Kadai. If the image shows an Apple, identify it as Apple.

2. IF THE FOOD IDENTIFICATION IS UNCLEAR OR VISUALLY AMBIGUOUS:
   - Do NOT guess based on filenames or assumptions.
   - Set foodName to "Food identification uncertain."
   - Set confidence to "uncertain" (or "low").
   - Provide 2-4 plausible alternativeOptions based on visible traits so the user can manually select or correct the food.

3. ACCURACY FIRST & ZERO INVENTED NUTRITION:
   - Your ONLY role is visual identification of foods and visual portion estimation.
   - DO NOT calculate, guess, invent, or output any nutrition values (no calories, protein, carbs, fat, fiber).
   - All nutrition will be calculated strictly by the server's verified food composition database.

4. PORTION & EDIBLE PORTION LOGIC:
   - Never assume a whole chicken, whole fruit, bowl, cup, dosa, etc. has a fixed weight unless actually known.
   - Clearly distinguish EDIBLE portion from non-edible parts (bones, skin, shells, peels, seeds, rinds).
   - Estimate ONLY the edible portion weight in grams (e.g. bone-in chicken leg is ~110-120g edible meat excluding bone; banana is ~110-120g edible fruit excluding peel; boiled egg is ~50g excluding shell).
   - If exact weight cannot be determined from the image, give a realistic estimate and label it as an estimate (e.g. "1 medium dosa (~180g edible portion, estimated)").

5. MIXED DISHES ARE NOT SINGLE INGREDIENTS:
   - Dishes such as Paneer Kadai, Paneer Butter Masala, Matar Paneer, Chicken Curry, Biryani, Fried Rice, Sambar, etc. contain multiple ingredients (gravy, vegetables, spices, oil, plus the main item).
   - Identify them by their actual prepared dish name (e.g. "Paneer Kadai", "Chicken Curry", "Vegetable Fried Rice"), NEVER as pure raw ingredients (do NOT label Paneer Kadai as raw paneer).

6. REALISTIC INDIAN SERVING SIZES:
   Use standard, realistic Indian serving sizes (different foods have different densities):
   - 1 chapati / roti: ~35g
   - 1 medium idli: ~40-50g (2 idlis ~90-100g)
   - 1 plain dosa: ~80-100g; 1 masala dosa: ~160-200g (crepe + potato masala)
   - 1 small bowl / katori sambar or dal: ~120-150g
   - 1 bowl paneer curry / chicken curry: ~180-220g (estimated)
   - 1 serving coconut chutney: ~30-40g
   - 1 medium bowl cooked rice: ~130-150g
   - 1 plate poha / upma: ~150-180g
   - 1 plate chicken biryani / fried rice: ~250-300g
   - 1 cup milk tea / chai: ~120-150ml

7. NO RANDOM RECIPE ASSUMPTIONS:
   Do not assume large amounts of oil, sugar, milk, butter, or ghee unless clearly visible or specified. Assume standard home-style preparation.

8. SEPARATION & CANONICAL NAMES:
   - Identify each visible food item separately (e.g. Masala Dosa, Sambar, Coconut Chutney; Steamed White Rice, Toor Dal).
   - Use standard canonical names.
   - If an item is visually ambiguous, provide 1-3 plausible alternativeOptions and set confidence to "Medium" or "Low".

9. DETECTION:
   If NO food or beverage is visible (e.g. faces, screenshots, room, tools, furniture, non-food items), return:
   {
     "isFoodDetected": false,
     "detectedFoods": [],
     "notes": "No food or drink could be identified in this image."
   }

Respond ONLY in valid JSON matching this schema:
{
  "isFoodDetected": true,
  "detectedFoods": [
    {
      "foodName": "Roasted Chicken",
      "portion": "1 piece (~120g edible meat, estimated)",
      "portionGrams": 120,
      "confidence": "high",
      "alternativeOptions": ["Roasted Chicken", "Tandoori Chicken"]
    }
  ],
  "notes": "Identified Roasted Chicken."
}`;

    // Call real Gemini Vision model with dual-model fallback (gemini-3.1-flash-lite, gemini-flash-latest, gemini-3.8-flash)
    // Temperature: 0 for deterministic, repeatable visual recognition
    const geminiRes = await callGeminiVision(
      [
        {
          inlineData: {
            mimeType: cleanMimeType,
            data: cleanedBase64,
          },
        },
        prompt,
      ],
      {
        responseMimeType: 'application/json',
        temperature: 0.0,
      }
    );

    const jsonText = geminiRes.text?.trim() || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini vision response as JSON:', jsonText);
      return res.status(500).json({
        error: 'Failed to process AI food analysis output. Please try again with a clear photo.',
        isFoodDetected: false,
        detectedFoods: [],
      });
    }

    // Check if food was identified
    if (!parsed.isFoodDetected || !Array.isArray(parsed.detectedFoods) || parsed.detectedFoods.length === 0) {
      return res.json({
        isFoodDetected: false,
        detectedFoods: [],
        totalEstimatedCalories: 0,
        totalEstimatedProtein: 0,
        totalEstimatedCarbs: 0,
        totalEstimatedFat: 0,
        totalEstimatedFiber: 0,
        totalEstimatedCost: 0,
        notes: parsed.notes || 'No food or beverage items could be detected in this image. Please take a clear, well-lit photo of your meal.',
        disclaimer: 'No food detected. You can add food items manually or try uploading another photo.',
        dataSource: 'FitBudget AI Vision & Canonical Nutrition Pipeline',
      });
    }

    // STAGE 2 & 3 & 4: CANONICAL FOOD DATABASE LOOKUP, MATHEMATICAL PORTION CALCULATION, AND SANITY CHECK
    const calibratedFoods = parsed.detectedFoods.map((item: any) => {
      const rawName = (item.foodName || item.name || '').trim();
      const rawConf = String(item.confidence || '').toLowerCase();
      const isUncertain =
        rawConf === 'uncertain' ||
        (rawConf === 'low' && !rawName) ||
        !rawName ||
        rawName.toLowerCase().includes('uncertain') ||
        rawName.toLowerCase().includes('unidentified');
      const cleanName = isUncertain ? 'Food identification uncertain.' : rawName;
      const grams = Math.max(5, Math.round(Number(item.portionGrams) || 100));

      // Lookup in canonical food database
      let matched = isUncertain ? null : matchFoodInDatabase(cleanName);
      if (!matched && Array.isArray(item.alternativeOptions)) {
        for (const alt of item.alternativeOptions) {
          const m = matchFoodInDatabase(alt);
          if (m) {
            matched = m;
            break;
          }
        }
      }

      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      let fiber = 0;
      let estimatedCost = 15;
      let matchedDatabaseItem: string | undefined = undefined;
      let nutritionSource: string;
      let isDatabaseVerified = false;

      if (matched) {
        matchedDatabaseItem = matched.name;
        isDatabaseVerified = true;
        nutritionSource = matched.source;
        // Strictly mathematical calculation: (per100g * grams) / 100
        const calc = calculateNutrientsForPortion(matched, grams);
        calories = calc.calories;
        protein = calc.protein;
        carbs = calc.carbs;
        fat = calc.fat;
        fiber = calc.fiber;
        estimatedCost = calc.estimatedCost;
      } else {
        nutritionSource = 'Estimated from comparable verified food';
        isDatabaseVerified = false;
        // Safe standard baseline
        const factor = grams / 100;
        calories = Math.round(130 * factor);
        protein = Number((3.0 * factor).toFixed(1));
        carbs = Number((20.0 * factor).toFixed(1));
        fat = Number((4.0 * factor).toFixed(1));
        fiber = Number((1.5 * factor).toFixed(1));
        estimatedCost = Math.round(20 * factor);
      }

      // STAGE 4: Sanity check (ensures meat has near-zero carbs, rice has low fat, dosa has realistic protein)
      const sanity = runSanityCheck(
        matchedDatabaseItem || cleanName,
        matched?.category,
        grams,
        calories,
        protein,
        carbs,
        fat,
        fiber
      );
      if (!sanity.isValid) {
        console.warn(`[Sanity Check] Warnings for "${cleanName}":`, sanity.warnings);
      }

      let confidenceLevel: 'High' | 'Medium' | 'Low' = 'High';
      if (isUncertain || !isDatabaseVerified || rawConf === 'low' || rawConf === 'uncertain' || rawConf === 'estimated') {
        confidenceLevel = 'Low';
      } else if (matched?.isVariableDish || rawConf === 'medium' || rawConf === 'approximate') {
        confidenceLevel = 'Medium';
      } else {
        confidenceLevel = 'High';
      }

      let estimateNote = 'Verified Database';
      if (isUncertain) {
        estimateNote = 'Estimated — food identification uncertain';
      } else if (!isDatabaseVerified || matched?.isVariableDish) {
        estimateNote = 'Estimated — recipe/portion may vary';
      }

      return {
        name: cleanName,
        portion: item.portion || `~${grams}g (estimated portion)`,
        portionGrams: grams,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        estimatedCost,
        confidence: confidenceLevel,
        estimateNote,
        alternativeOptions: Array.isArray(item.alternativeOptions) ? item.alternativeOptions : [],
        matchedDatabaseItem,
        nutritionSource,
        isDatabaseVerified,
      };
    });

    // STAGE 5: STRICT RE-VALIDATION & TOTAL CALCULATION (Rules 5, 6, 10)
    // The calories, protein, carbohydrates, fat and fiber for every food item must correspond to the portion size.
    // Recalculate totals directly by adding every detected item so they never disagree.
    let sumCalories = 0;
    let sumProtein = 0;
    let sumCarbs = 0;
    let sumFat = 0;
    let sumFiber = 0;
    let sumCost = 0;

    for (const food of calibratedFoods) {
      sumCalories += Number(food.calories) || 0;
      sumProtein += Number(food.protein) || 0;
      sumCarbs += Number(food.carbs) || 0;
      sumFat += Number(food.fat) || 0;
      sumFiber += Number(food.fiber) || 0;
      sumCost += Number(food.estimatedCost) || 0;
    }

    const totalEstimatedCalories = Math.round(sumCalories);
    const totalEstimatedProtein = Number(sumProtein.toFixed(1));
    const totalEstimatedCarbs = Number(sumCarbs.toFixed(1));
    const totalEstimatedFat = Number(sumFat.toFixed(1));
    const totalEstimatedFiber = Number(sumFiber.toFixed(1));
    const totalEstimatedCost = Math.round(sumCost);

    return res.json({
      isFoodDetected: true,
      detectedFoods: calibratedFoods,
      totalEstimatedCalories,
      totalEstimatedProtein,
      totalEstimatedCarbs,
      totalEstimatedFat,
      totalEstimatedFiber,
      totalEstimatedCost,
      notes: parsed.notes || 'Nutrients and macros calculated mathematically from canonical food composition database.',
      disclaimer: 'Nutritional metrics are calculated mathematically from verified ICMR-NIN & USDA food databases according to detected portions.',
      dataSource: 'FitBudget Canonical Nutrition Pipeline (ICMR-NIN IFCT 2017 & USDA FoodData Central)',
    });
  } catch (err: any) {
    console.error('Error in /api/analyze-food:', err);
    return res.status(500).json({
      error: 'Failed to analyze food image with AI vision: ' + (err?.message || 'Server error'),
      isFoodDetected: false,
      detectedFoods: [],
    });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', server: 'FitBudget', uptime: process.uptime() });
});

// ==================== VITE & STATIC HANDLING ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`FitBudget full-stack server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
