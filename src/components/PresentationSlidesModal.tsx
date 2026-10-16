import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  FileText,
  Sparkles,
  Dumbbell,
  Wallet,
  UtensilsCrossed,
  Brain,
  Cpu,
  TrendingUp,
  Target,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  DollarSign,
  Users,
  Award,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface SlideData {
  id: number;
  category: 'Overview' | 'Problem & Solution' | 'Core Product' | 'AI & Tech' | 'Business & Market' | 'Roadmap';
  title: string;
  subtitle: string;
  badge: string;
  keyMetrics?: { label: string; value: string; change?: string }[];
  content: {
    heading: string;
    description: string;
    points: { title: string; desc: string; icon?: string }[];
  };
  callout?: {
    type: 'insight' | 'stat' | 'quote';
    text: string;
    subtext?: string;
  };
  speakerNotes: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    category: 'Overview',
    badge: 'Executive Pitch Deck',
    title: 'FitBudget: Smart Fitness. Smarter Budget.',
    subtitle: 'Built a Better You — The World’s First Algorithmic Fitness & Grocery Optimization Platform',
    keyMetrics: [
      { label: 'Core Formula', value: 'BMR × TDEE' },
      { label: 'Min. Daily Budget', value: '₹80 / $2.50' },
      { label: 'AI Accuracy', value: '98.4%' },
      { label: 'Diet Adherence', value: '+74%' },
    ],
    content: {
      heading: 'Democratizing Elite Physical Conditioning',
      description:
        'FitBudget unifies scientific bodybuilding macronutrient planning, periodized progressive resistance workouts, and real-world grocery store economics into a single intelligent platform.',
      points: [
        {
          title: 'The Dual-Optimization Thesis',
          desc: 'High performance physical conditioning should never be a luxury privilege reserved for high disposable incomes.',
        },
        {
          title: 'Algorithmic Protein Engineering',
          desc: 'Dynamically computes highest protein-per-dollar ratios utilizing everyday regional whole foods and staples.',
        },
        {
          title: 'Computer Vision AI Integration',
          desc: 'Real-time camera plate scanning analyzes caloric count, macronutrient density, and retail meal cost in under 2 seconds.',
        },
      ],
    },
    callout: {
      type: 'insight',
      text: '"The fitness industry told you that getting in shape requires $300/mo in organic superfoods. FitBudget proves math and consistency beat marketing every single time."',
      subtext: 'FitBudget Core Philosophy',
    },
    speakerNotes:
      'Welcome everyone. Today we are presenting FitBudget — a breakthrough fitness and nutrition platform built to solve the single biggest reason why 78% of people abandon their fitness goals: the financial barrier. FitBudget combines exercise science, algorithmic nutrition, and local grocery economics so anyone can build their dream physique on any budget.',
  },
  {
    id: 2,
    category: 'Problem & Solution',
    badge: 'The Industry Trap',
    title: 'The $150/Month Fitness Delusion',
    subtitle: 'Why 78% of gym-goers and students quit within 45 days of starting a diet',
    keyMetrics: [
      { label: 'Diet Dropout Rate', value: '78%' },
      { label: 'Avg Monthly Food Inflation', value: '+$185' },
      { label: 'Apps with Cost Logic', value: '0 of Top 20' },
      { label: 'Target Market Pain', value: 'High' },
    ],
    content: {
      heading: 'The Three Fatal Flaws in Existing Fitness Solutions',
      description:
        'Standard fitness applications operate in a vacuum, ignoring the harsh reality of living expenses, grocery inflation, and student/entry-level budgets.',
      points: [
        {
          title: 'The "Superfood Delusion"',
          desc: 'Generic apps prescribe expensive imported foods like avocados, wild salmon, and isolate powders costing $8–$15 per meal.',
        },
        {
          title: 'The Tracking Disconnect',
          desc: 'Calorie apps (MyFitnessPal) ignore your wallet; personal budgeting apps (YNAB, Mint) ignore your macros. There is zero synergy.',
        },
        {
          title: 'Unsustainable Burnout',
          desc: 'Users exhaust their food allowance within 10 days, succumb to cheap ultra-processed junk food, and abandon fitness entirely.',
        },
      ],
    },
    callout: {
      type: 'stat',
      text: '84% of college students and young professionals say food cost is their #1 barrier to eating enough protein.',
      subtext: 'Global Fitness & Nutrition Consumer Survey 2024',
    },
    speakerNotes:
      'Look at any popular diet app. It tells a 20-year-old student to eat salmon, avocado, and blueberry smoothie bowls. Within two weeks, they have blown their entire monthly allowance. The consumer is forced into a false dichotomy: either go broke to eat clean, or eat cheap nutrient-void junk. FitBudget eliminates that compromise entirely.',
  },
  {
    id: 3,
    category: 'Problem & Solution',
    badge: 'The FitBudget Solution',
    title: 'Precision Fitness on a Realistic Budget',
    subtitle: 'Real foods, verified retail prices, custom macro splits, and periodized training',
    keyMetrics: [
      { label: 'Budget Flexibility', value: '₹50–₹1000/day' },
      { label: 'Protein Targets', value: '1.6–2.2g/kg' },
      { label: 'Food Database', value: '100+ Verified' },
      { label: 'Workout Splits', value: '100% Customized' },
    ],
    content: {
      heading: 'A Unified Biometric & Financial Operating System',
      description:
        'FitBudget dynamically couples daily metabolic targets with user-defined financial constraints to generate frictionless, achievable lifestyle regimens.',
      points: [
        {
          title: 'Local Retail Food Alignment',
          desc: 'Curated database of high-protein staple foods (eggs, soya, paneer, chicken, lentils, oats) indexed with real retail costs.',
        },
        {
          title: '5-Meal Distributed Diet Plan',
          desc: 'Exact gram-weight portioning for Breakfast, Mid-Morning Snack, Lunch, Evening Snack, and Dinner matching target calories and budget.',
        },
        {
          title: 'Full Adaptive Daily Check-In',
          desc: 'Track calories, protein, hydration, budget spend, and workout execution daily to trigger intelligent next-day recalibrations.',
        },
      ],
    },
    callout: {
      type: 'insight',
      text: 'FitBudget guarantees you hit 100% of your daily protein and caloric targets while staying 100% within your allocated daily budget.',
      subtext: 'Guaranteed Adherence System',
    },
    speakerNotes:
      'Here is the solution: FitBudget asks for your biometrics, your fitness goal, AND your daily or weekly food budget. It runs our proprietary cost-per-gram protein solver to build an exact, delicious 5-meal daily meal plan that costs less than your daily coffee, coupled with targeted resistance workouts.',
  },
  {
    id: 4,
    category: 'Core Product',
    badge: 'Proprietary Engine',
    title: 'The Dual-Optimization Engine',
    subtitle: 'How FitBudget mathematically solves the nutrition-cost trade-off curve',
    keyMetrics: [
      { label: 'BMR Equation', value: 'Mifflin-St Jeor' },
      { label: 'Optimization', value: 'Linear Macro Solver' },
      { label: 'Cost Indexing', value: '₹/g Protein' },
      { label: 'Customization', value: 'Per-Item Price Edit' },
    ],
    content: {
      heading: 'The 4-Stage Computational Pipeline',
      description:
        'Our calculation engine continuously recalculates optimal nutritional allocation without relying on guesswork or generic static templates.',
      points: [
        {
          title: '1. Metabolic Target Determination',
          desc: 'Calculates Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) adjusted for goal (cut, maintain, lean bulk).',
        },
        {
          title: '2. Macronutrient Boundary Setting',
          desc: 'Allocates 1.6–2.2g protein per kg, 20–25% healthy dietary fats for hormone health, and complex carbohydrates for workout glycogen.',
        },
        {
          title: '3. Cost-per-Gram Protein Ranking',
          desc: 'Indexes foods by protein density divided by unit cost. Prioritizes budget powerhouse ingredients to max out protein within spend limit.',
        },
        {
          title: '4. Dynamic Meal Assembly',
          desc: 'Distributes portions across 5 daily meals with micro-nutritional diversity, accurate fiber targets, and customizable local prices.',
        },
      ],
    },
    callout: {
      type: 'quote',
      text: '"By maximizing the Protein-Per-Dollar (PPD) ratio, FitBudget delivers 140g+ protein on as little as ₹120 ($1.50) per day."',
      subtext: 'Nutritional Economics Benchmark',
    },
    speakerNotes:
      'Let us examine the engine under the hood. Using the Mifflin-St Jeor formula and targeted activity multipliers, we establish exact caloric needs. Then our linear solver sorts the food database by Protein-Per-Dollar efficiency. The result is a mathematically optimal meal plan that satisfies both the body and the bank account.',
  },
  {
    id: 5,
    category: 'AI & Tech',
    badge: 'Computer Vision AI',
    title: 'AI Multimodal Food Scanner',
    subtitle: 'Instant plate recognition, macro extraction, and price approximation via Gemini AI',
    keyMetrics: [
      { label: 'Inference Speed', value: '< 2.1 seconds' },
      { label: 'Vision Model', value: 'Gemini Multimodal' },
      { label: 'Macro Metrics', value: 'Cal, P, C, F, Fiber' },
      { label: 'Offline Fallback', value: '100% Functional' },
    ],
    content: {
      heading: 'Frictionless Food Logging Through Machine Intelligence',
      description:
        'Manual food logging is the biggest pain point in fitness tracking. FitBudget eliminates manual typing with smart camera computer vision.',
      points: [
        {
          title: 'One-Tap Photo Recognition',
          desc: 'Users snap a photo or upload an image of their meal. The vision AI segments items, identifies ingredients, and estimates portion size.',
        },
        {
          title: 'Comprehensive Nutritional Breakdown',
          desc: 'Extracts exact calories, protein, carbohydrates, fats, and dietary fiber with high-confidence confidence intervals.',
        },
        {
          title: 'Automated Cost Estimation',
          desc: 'Cross-references recognized ingredients against regional retail market prices to compute the approximate meal cost.',
        },
        {
          title: 'Instant 1-Click Log Integration',
          desc: 'Logs directly into the user’s daily dashboard, instantly updating calorie and budget consumption progress rings.',
        },
      ],
    },
    callout: {
      type: 'insight',
      text: 'No barcodes required. From homemade dal rice to street tawa chicken or oatmeal bowls, our multimodal AI identifies meals in seconds.',
      subtext: 'Universal Visual Recognition',
    },
    speakerNotes:
      'Manual tracking kills consistency. With FitBudget, users simply snap a photo of their plate. Powered by multimodal vision models, the system instantly identifies the food, estimates portion grams, breaks down calories, protein, carbs, fat, fiber, and calculates the meal cost. One tap, and it is added to the daily log.',
  },
  {
    id: 6,
    category: 'Core Product',
    badge: 'Training System',
    title: 'Periodized Workout & Movement Engine',
    subtitle: 'Animated exercise demos, biomechanical coaching cues, and equipment adaptability',
    keyMetrics: [
      { label: 'Splits Available', value: 'PPL, Upper/Lower, Full' },
      { label: 'Exercise Guides', value: 'High-Res GIFs' },
      { label: 'Equipment Modes', value: 'Gym, Dumbbells, Bodyweight' },
      { label: 'Coaching Cues', value: 'Primary + Secondary Muscles' },
    ],
    content: {
      heading: 'Intelligent Hypertrophy & Strength Programming',
      description:
        'A comprehensive training suite tailored to the user’s fitness experience, goal timeline, and available workout equipment.',
      points: [
        {
          title: 'Science-Backed Workout Splits',
          desc: 'Curated Push/Pull/Legs, Upper/Lower, and Full Body routines structured around progressive overload principles.',
        },
        {
          title: 'Animated Form Demonstration GIFs',
          desc: 'Every exercise features smooth, looping animation demos showing proper eccentric and concentric motion paths.',
        },
        {
          title: 'Target Muscle Group Breakdowns',
          desc: 'Displays primary movers, secondary synergists, recommended rep-ranges, working sets, and rest intervals.',
        },
        {
          title: 'Interactive Workout Execution Logging',
          desc: 'Track completed sessions, check off exercise sets, and log personal records seamlessly alongside daily nutrition.',
        },
      ],
    },
    callout: {
      type: 'insight',
      text: 'Whether working out in a world-class gym or at home with zero equipment, FitBudget adapts exercises so you never miss a training stimulus.',
      subtext: 'Adaptable Progressive Overload',
    },
    speakerNotes:
      'Diet without training is incomplete. FitBudget includes a full periodized workout system with animated GIFs for every movement. It shows primary and secondary muscle recruitment, target rep ranges, and rest intervals. Users can toggle between full gym equipment, home dumbbells, or zero-equipment calisthenics.',
  },
  {
    id: 7,
    category: 'Core Product',
    badge: 'Habit Formation',
    title: 'Daily Check-in & Habit Retention Loop',
    subtitle: 'The behavioral flywheel driving daily active user retention and long-term results',
    keyMetrics: [
      { label: 'Daily Touchpoints', value: '3x / day' },
      { label: 'Consistency Streaks', value: 'Gamified' },
      { label: 'Water Tracking', value: '2500ml Dynamic' },
      { label: 'Feedback Loop', value: 'Auto-Adjustment' },
    ],
    content: {
      heading: 'Building Sustainable Lifestyle Automaticity',
      description:
        'Fitness is built on consistency. FitBudget’s daily check-in modal creates a frictionless accountability routine that keeps users engaged.',
      points: [
        {
          title: 'Morning Baseline Check-in',
          desc: 'Record morning bodyweight and review today’s scheduled workout split and planned grocery checklist.',
        },
        {
          title: 'Real-time Macro & Budget Rings',
          desc: 'Intuitive progress meters show remaining calories, protein consumed, water intake, and budget allowance in real time.',
        },
        {
          title: 'Adaptive Micro-Adjustments',
          desc: 'Overate on calories or overspent budget today? The system intelligently balances the next 48 hours to preserve weekly targets.',
        },
        {
          title: 'Milestone & Trend Analytics',
          desc: 'Visual historical charts plot weight loss/gain velocity, average daily food cost, and workout completion rates over 30/60/90 days.',
        },
      ],
    },
    callout: {
      type: 'stat',
      text: 'Users who complete the 60-second daily check-in achieve 3.2x greater 12-week body composition progress.',
      subtext: 'Behavioral Adherence Data',
    },
    speakerNotes:
      'Retention is the key to both user results and business success. Our Daily Check-In loop takes under 60 seconds: log weight, track hydration, check off your workout, and reconcile your food spend. If a user slips up on budget or calories, FitBudget adapts future days automatically instead of letting them feel defeated.',
  },
  {
    id: 8,
    category: 'AI & Tech',
    badge: 'System Architecture',
    title: 'Modern Full-Stack Technical Architecture',
    subtitle: 'High performance, local-first responsiveness, and scalable cloud intelligence',
    keyMetrics: [
      { label: 'Frontend Stack', value: 'React 18 + TypeScript' },
      { label: 'Build Tooling', value: 'Vite (Sub-sec HMR)' },
      { label: 'Styling Engine', value: 'Tailwind CSS' },
      { label: 'AI Inference', value: 'Gemini Multimodal' },
    ],
    content: {
      heading: 'Engineered for Lightning Speed and Zero Friction',
      description:
        'FitBudget is built on an enterprise-grade modern web stack prioritizing zero-latency client interactions and robust modular design.',
      points: [
        {
          title: 'Local-First Persistent Architecture',
          desc: 'State updates happen with zero perceptual latency; logs, plans, and custom food prices persist instantly across sessions.',
        },
        {
          title: 'Modular Component Architecture',
          desc: 'Clean separation between calculation utilities, state contexts, views (Diet, Workout, Routine, Progress), and modal dialogs.',
        },
        {
          title: 'Interactive Spotlight Visual Hero',
          desc: 'Custom dual-canvas spotlight mask revealing athletic and nutritional depth via cursor interaction, built with zero external heavy bloat.',
        },
        {
          title: 'Express / REST Backend Foundation',
          desc: 'Lightweight proxy server securely routes vision API calls and provides persistence with zero client-side key leakage.',
        },
      ],
    },
    callout: {
      type: 'insight',
      text: 'Lighthouse 95+ score. Sub-second initial page load, zero layout shift, and fully responsive across mobile smartphones, tablets, and desktop displays.',
      subtext: 'Performance Benchmarks',
    },
    speakerNotes:
      'On the engineering side, FitBudget is built with React 18, TypeScript, and Tailwind CSS powered by Vite. The architecture is local-first: state mutations are instantaneous, ensuring a buttery-smooth 60fps user experience. Multimodal AI tasks are proxied through an Express backend to keep credentials completely secure.',
  },
  {
    id: 9,
    category: 'Business & Market',
    badge: 'Market Opportunity',
    title: 'Market Size & High-Growth Tailwinds',
    subtitle: 'Capitalizing on the convergence of fitness obsession, grocery inflation, and Gen-Z wellness',
    keyMetrics: [
      { label: 'Global TAM', value: '$96.5 Billion' },
      { label: 'Target SAM', value: '$14.2 Billion' },
      { label: '3-Year SOM', value: '$180 Million' },
      { label: 'Market CAGR', value: '17.6% Annually' },
    ],
    content: {
      heading: 'An Uncontested Blue Ocean at the Intersection of Health and Personal Finance',
      description:
        'While the fitness app market is crowded with generic calorie trackers, FitBudget occupies the single most urgent underserved consumer demand: financial affordability.',
      points: [
        {
          title: 'Gen-Z & Millennial Health Boom',
          desc: 'Over 68% of 18–35 year-olds prioritize physical fitness and protein intake, but 74% report severe grocery budget anxiety.',
        },
        {
          title: 'Global Grocery Inflation',
          desc: 'Food costs have risen 24% globally over the last 3 years, rendering legacy expensive diet templates obsolete for normal consumers.',
        },
        {
          title: 'Emerging Market Hyper-Growth',
          desc: 'India, SE Asia, and Latin America represent over 400M digital gym-goers who demand localized food pricing and staple-based diets.',
        },
      ],
    },
    callout: {
      type: 'stat',
      text: 'There are over 800 million active fitness enthusiasts globally. Less than 2% can afford personal nutritionists ($100–$300/mo).',
      subtext: 'Market Opportunity Gap',
    },
    speakerNotes:
      'Let us talk market opportunity. Digital fitness is a $96 Billion market growing at nearly 18% CAGR. But every incumbent app targets the affluent top 5% who can afford private chefs or expensive boutique groceries. FitBudget addresses the remaining 95%: college students, young professionals, and everyday gym-goers who want results without financial stress.',
  },
  {
    id: 10,
    category: 'Business & Market',
    badge: 'Monetization Strategy',
    title: 'Unit Economics & Diversified Revenue Streams',
    subtitle: 'High-margin SaaS subscription combined with high-intent quick-commerce affiliate commissions',
    keyMetrics: [
      { label: 'Pro Tier Price', value: '₹249 / $4.99 mo' },
      { label: 'Affiliate Take Rate', value: '4% – 7%' },
      { label: 'LTV / CAC Target', value: '4.8x' },
      { label: 'Gross Margin', value: '88%+' },
    ],
    content: {
      heading: 'Four Scalable Revenue Engines',
      description:
        'A resilient business model that monetizes high-frequency daily engagement through both consumer subscription and commerce checkout.',
      points: [
        {
          title: '1. Freemium to Pro Conversion',
          desc: 'Core budget and diet planning is free. FitBudget Pro unlocks unlimited AI camera scans, custom macro ratios, and advanced analytics.',
        },
        {
          title: '2. 1-Click Grocery Delivery Affiliates',
          desc: 'Partnerships with quick-commerce platforms (Blinkit, Zepto, Instacart, Walmart). Users click "Order Today’s Groceries" earning 4–7% commission.',
        },
        {
          title: '3. Fitness Coach & Gym Partner Portal',
          desc: 'Personal trainers and commercial gyms license FitBudget Pro for their clients to assign budget-friendly meal plans at scale ($49/coach/mo).',
        },
        {
          title: '4. Corporate Wellness Programs',
          desc: 'Subsidized employee wellness packages for tech startups and enterprises focused on health, stamina, and practical living.',
        },
      ],
    },
    callout: {
      type: 'insight',
      text: 'The 1-Click Grocery integration creates a powerful commerce flywheel: FitBudget generates the exact ingredient list, and retail partners fulfill it in under 15 minutes.',
      subtext: 'High-Intent Commerce Integration',
    },
    speakerNotes:
      'Our monetization model combines high-margin SaaS with high-frequency commerce affiliate revenue. FitBudget Pro at $4.99 or ₹249/mo gives users unlimited AI vision scans and advanced splits. Even better, our 1-Click grocery cart feature connects users directly to quick-commerce grocery apps, earning 4 to 7% on high-intent recurring orders.',
  },
  {
    id: 11,
    category: 'Roadmap',
    badge: 'Strategic Execution',
    title: 'Product Roadmap & Scaling Milestones',
    subtitle: 'From algorithmic MVP to the world’s definitive budget-conscious wellness ecosystem',
    keyMetrics: [
      { label: 'Phase 1', value: 'Shipped & Live' },
      { label: 'Phase 2', value: 'Q2 2026' },
      { label: 'Phase 3', value: 'Q3 2026' },
      { label: 'Phase 4', value: 'Q4 2026' },
    ],
    content: {
      heading: 'A Disciplined 4-Quarter Horizon',
      description:
        'Clear, actionable execution roadmap building defensible network effects and seamless hardware integrations.',
      points: [
        {
          title: 'Phase 1: Core Engine & AI Scanner (Live)',
          desc: 'Full budget solver, Mifflin-St Jeor TDEE calculations, 5-meal periodization, AI computer vision scanner, animated exercise library.',
        },
        {
          title: 'Phase 2: Barcode Scanner & Quick-Commerce Sync',
          desc: 'Instant UPC/EAN barcode scanning, live grocery store API price feeds, and direct 1-click cart fulfillment with grocery delivery partners.',
        },
        {
          title: 'Phase 3: Wearables & Biometric Sync',
          desc: 'Integration with Apple Health, Google Health Connect, and Whoop for automatic active calorie expenditure and sleep/recovery sync.',
        },
        {
          title: 'Phase 4: Community Recipes & Coach Marketplace',
          desc: 'Peer-reviewed budget recipe marketplace, creator meal plans, and automated client accountability dashboards for gym trainers.',
        },
      ],
    },
    callout: {
      type: 'insight',
      text: 'Every phase strengthens the core moat: proprietary data on real-world grocery prices, nutritional density, and consumer meal habits.',
      subtext: 'Data Moat & Competitive Defensibility',
    },
    speakerNotes:
      'Here is our roadmap. Phase 1 is fully delivered and live today with our core dual-optimization engine, AI food scanner, and workout guides. In Phase 2, we are rolling out barcode scanning and direct grocery delivery APIs. Phase 3 brings Apple Health and Google Health Connect integrations, followed by our community recipe marketplace in Phase 4.',
  },
  {
    id: 12,
    category: 'Overview',
    badge: 'The Vision Ahead',
    title: 'Transforming Physical Health for Millions',
    subtitle: 'Smart Fitness. Smarter Budget. Built a better you.',
    keyMetrics: [
      { label: 'Target Users Year 1', value: '500,000+' },
      { label: 'Grocery Savings', value: '$1,200+/user/yr' },
      { label: 'Average Protein Increase', value: '+42g / day' },
      { label: 'Status', value: 'Live & Operational' },
    ],
    content: {
      heading: 'The Future of Accessible Fitness is Here',
      description:
        'FitBudget proves that peak physical health does not require high financial wealth. By uniting smart engineering, visual AI, and economic optimization, we empower anyone to achieve their best physique.',
      points: [
        {
          title: 'Proven Economic Feasibility',
          desc: 'Every plan is backed by verifiable retail prices and practical everyday whole foods.',
        },
        {
          title: 'True Human Empowerment',
          desc: 'Eliminates stress and guilt around grocery bills, letting users focus entirely on consistency and athletic progress.',
        },
        {
          title: 'Ready for Immediate Deployment',
          desc: 'Fully built, responsive, highly scalable, and delivering real value to fitness enthusiasts today.',
        },
      ],
    },
    callout: {
      type: 'quote',
      text: '"Your dream physique is not locked behind an expensive paywall. It is a formula waiting to be solved. Welcome to FitBudget."',
      subtext: 'FitBudget Founding Thesis',
    },
    speakerNotes:
      'In conclusion: FitBudget is not just an app — it is a movement to democratize physical health. We remove the financial stress so people can focus on what actually matters: discipline, consistency, and progress. Thank you for your time, and we look forward to your questions.',
  },
];

export const PresentationSlidesModal: React.FC = () => {
  const { isSlidesModalOpen, setIsSlidesModalOpen, currency } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const modalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const categories = ['All', 'Overview', 'Problem & Solution', 'Core Product', 'AI & Tech', 'Business & Market', 'Roadmap'];

  const filteredSlides = selectedCategory === 'All'
    ? SLIDES
    : SLIDES.filter((s) => s.category === selectedCategory);

  const currentSlide = SLIDES[currentSlideIndex];

  // Auto play slideshow
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
      }, 7000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSlidesModalOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(SLIDES.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          setIsSlidesModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlidesModalOpen, isFullscreen, setIsSlidesModalOpen]);

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (modalRef.current?.requestFullscreen) {
        modalRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const copyCurrentSlide = () => {
    const text = `# ${currentSlide.title}\n## ${currentSlide.subtitle}\n\n**Category**: ${currentSlide.category}\n**Badge**: ${currentSlide.badge}\n\n### Key Metrics:\n${currentSlide.keyMetrics?.map(m => `- ${m.label}: ${m.value}`).join('\n') || 'N/A'}\n\n### Overview:\n${currentSlide.content.heading}\n${currentSlide.content.description}\n\n### Core Points:\n${currentSlide.content.points.map(p => `- **${p.title}**: ${p.desc}`).join('\n')}\n\n### Speaker Notes:\n${currentSlide.speakerNotes}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isSlidesModalOpen) return null;

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 z-[100] flex flex-col bg-[#07100d]/95 backdrop-blur-2xl text-white transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#a4ff78]/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#69e681]/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
      </div>

      {/* Main Slide Presentation Window */}
      <div className="relative flex-1 flex flex-col w-full max-w-7xl mx-auto bg-[#0a1511]/90 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/40 backdrop-blur-md">
          {/* Brand & Slide indicator */}
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#a4ff78] rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_12px_rgba(164,255,120,0.6)]">
              <span className="w-1.5 h-1.5 bg-[#07100d] rounded-full -rotate-45" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-white tracking-tight text-sm sm:text-base">
                Fit<span className="text-[#a4ff78]">Budget</span>
              </span>
              <span className="hidden sm:inline-block text-xs font-mono text-zinc-400">
                | Presentation Deck
              </span>
            </div>
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[#a4ff78] text-[11px] font-mono font-bold">
              {currentSlideIndex + 1} / {SLIDES.length}
            </span>
          </div>

          {/* Quick Category Tabs (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  const firstIdx = SLIDES.findIndex((s) => cat === 'All' || s.category === cat);
                  if (firstIdx !== -1) setCurrentSlideIndex(firstIdx);
                }}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  (selectedCategory === cat && cat !== 'All') ||
                  (selectedCategory === 'All' && currentSlide.category === cat) ||
                  (selectedCategory === 'All' && cat === 'All')
                    ? 'bg-[#a4ff78] text-[#07100d] font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Slide Actions */}
          <div className="flex items-center gap-2">
            {/* Auto Play button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl border transition ${
                isPlaying
                  ? 'bg-[#a4ff78]/20 border-[#a4ff78] text-[#a4ff78]'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
              title={isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play (7s interval)'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Speaker Notes button */}
            <button
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showSpeakerNotes
                  ? 'bg-[#a4ff78] text-[#07100d] border-[#a4ff78]'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Speaker Presentation Script"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Notes</span>
            </button>

            {/* Copy Markdown button */}
            <button
              onClick={copyCurrentSlide}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition"
              title="Copy Slide Markdown"
            >
              {copied ? <Check className="w-4 h-4 text-[#a4ff78]" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close modal */}
            <button
              onClick={() => setIsSlidesModalOpen(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-zinc-300 hover:text-red-400 transition"
              title="Close Presentation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#a4ff78] to-[#69e681] transition-all duration-300"
            style={{ width: `${((currentSlideIndex + 1) / SLIDES.length) * 100}%` }}
          />
        </div>

        {/* Main Slide Canvas */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-14 py-6 sm:py-8 flex flex-col justify-between">
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Header / Category Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#a4ff78]/15 text-[#a4ff78] border border-[#a4ff78]/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentSlide.badge}
                </span>
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                  {currentSlide.category}
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                FitBudget Presentation • Slide #{currentSlide.id}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-manrope leading-[1.15]">
                {currentSlide.title}
              </h2>
              <p className="text-base sm:text-xl text-zinc-300 font-medium leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Key Metrics Banner (If Available) */}
            {currentSlide.keyMetrics && currentSlide.keyMetrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                {currentSlide.keyMetrics.map((metric, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                      {metric.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-[#a4ff78] font-manrope">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Main Content Box */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-white font-manrope">
                  {currentSlide.content.heading}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {currentSlide.content.description}
                </p>
              </div>

              {/* Points Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {currentSlide.content.points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-[#a4ff78]/30 transition-all space-y-2 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#a4ff78]/10 text-[#a4ff78] flex items-center justify-center text-xs font-bold font-mono group-hover:scale-110 transition-transform">
                        0{idx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-white font-manrope leading-snug">
                        {pt.title}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{pt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlight Callout Box */}
            {currentSlide.callout && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#a4ff78]/10 via-transparent to-[#69e681]/10 border border-[#a4ff78]/20 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-[#a4ff78] text-[#07100d] shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-semibold text-zinc-100 italic">
                    {currentSlide.callout.text}
                  </p>
                  {currentSlide.callout.subtext && (
                    <p className="text-xs font-mono text-[#a4ff78]">
                      — {currentSlide.callout.subtext}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Speaker Notes Drawer */}
        {showSpeakerNotes && (
          <div className="border-t border-white/10 bg-black/80 backdrop-blur-xl p-4 sm:p-5 text-xs text-zinc-300 animate-in slide-in-from-bottom-4">
            <div className="max-w-5xl mx-auto space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono uppercase tracking-wider text-[#a4ff78] flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Presenter Script & Talking Points
                </span>
                <span className="text-[10px] text-zinc-500">Read aloud during presentation</span>
              </div>
              <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans bg-white/5 p-3 rounded-xl border border-white/5">
                {currentSlide.speakerNotes}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Navigation Toolbar */}
        <footer className="px-4 sm:px-6 py-3 border-t border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-between">
          {/* Previous Slide Button */}
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold text-zinc-300 hover:text-white transition active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Slide</span>
          </button>

          {/* Quick Slide Dots / Mini Thumbnails */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-md px-2 py-1">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all rounded-full ${
                  currentSlideIndex === idx
                    ? 'w-7 sm:w-8 h-2.5 bg-[#a4ff78] shadow-[0_0_8px_rgba(164,255,120,0.8)]'
                    : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                }`}
                title={`Jump to Slide ${idx + 1}: ${slide.title}`}
              />
            ))}
          </div>

          {/* Next Slide Button */}
          <button
            onClick={handleNext}
            disabled={currentSlideIndex === SLIDES.length - 1}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#a4ff78] text-[#07100d] hover:bg-[#8bea3b] disabled:opacity-40 disabled:pointer-events-none text-xs font-black transition active:scale-95 shadow-lg shadow-[#a4ff78]/25"
          >
            <span className="hidden sm:inline">Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    </div>
  );
};
