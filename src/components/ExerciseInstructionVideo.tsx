import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';

interface ExerciseInstructionVideoProps {
  exerciseName: string;
  targetMuscle?: string;
  instructions?: string;
}

interface BiomechanicsProfile {
  category: 'pushup' | 'incline_pushup' | 'plank' | 'squat' | 'lunge' | 'glute_bridge' | 'pike_pushup' | 'superman' | 'climbers' | 'bench_press' | 'bent_row' | 'overhead_press' | 'rdl' | 'bicep_curl' | 'lat_pulldown' | 'leg_press' | 'generic';
  duration: number; // in seconds (e.g. 10 - 14s)
  primaryMuscle: string;
  activeJoints: string;
  tempo: string; // e.g. "3-1-1"
  cues: [string, string, string];
  angleTarget: string;
}

// Map any exercise name to its specific biomechanics profile
function getExerciseProfile(name: string, targetMuscle: string = ''): BiomechanicsProfile {
  const n = name.toLowerCase();
  const m = targetMuscle.toLowerCase();

  if (n.includes('incline') || n.includes('knee push')) {
    return {
      category: 'incline_pushup',
      duration: 12,
      primaryMuscle: 'Pectoralis Major & Core',
      activeJoints: 'Elbows, Shoulders',
      tempo: '2s Lower • 1s Press',
      cues: ['Hands shoulder-width apart', 'Elbows at 45° angle', 'Maintain straight spine'],
      angleTarget: '45° Elbow Flare',
    };
  }
  if (n.includes('pike')) {
    return {
      category: 'pike_pushup',
      duration: 12,
      primaryMuscle: 'Anterior Deltoids & Triceps',
      activeJoints: 'Shoulders, Elbows',
      tempo: '2s Lower • 1s Press',
      cues: ['Hips high in inverted V', 'Lower crown of head ahead of hands', 'Press floor away actively'],
      angleTarget: '90° Inverted Apex',
    };
  }
  if (n.includes('push-up') || n.includes('pushup')) {
    return {
      category: 'pushup',
      duration: 12,
      primaryMuscle: 'Pectoralis Major, Triceps & Anterior Deltoid',
      activeJoints: 'Elbows, Shoulders',
      tempo: '2s Lower • 1s Pause • 1s Press',
      cues: ['Rigid plank line from heels to head', 'Elbows tucked 45° from torso', 'Chest hovers 1 inch from floor'],
      angleTarget: '90° Elbow Depth',
    };
  }
  if (n.includes('plank')) {
    return {
      category: 'plank',
      duration: 15,
      primaryMuscle: 'Rectus Abdominis & Transverse Core',
      activeJoints: 'Isometric Core & Pelvis',
      tempo: 'Continuous Isometric Tension',
      cues: ['Forearms parallel under shoulders', 'Tuck pelvis & squeeze glutes', 'Do not let lower back sag'],
      angleTarget: '180° Neutral Line',
    };
  }
  if (n.includes('goblet') || (n.includes('squat') && n.includes('db'))) {
    return {
      category: 'squat',
      duration: 14,
      primaryMuscle: 'Quadriceps, Glutes & Core',
      activeJoints: 'Hips, Knees, Ankles',
      tempo: '3s Lower • 1s Pause • 1s Drive',
      cues: ['Hold dumbbell firmly against sternum', 'Hips back, knees track over 2nd toe', 'Thighs reach parallel depth'],
      angleTarget: '90° Parallel Knee Flexion',
    };
  }
  if (n.includes('squat')) {
    return {
      category: 'squat',
      duration: 12,
      primaryMuscle: 'Quadriceps & Gluteus Maximus',
      activeJoints: 'Hips, Knees, Ankles',
      tempo: '2s Lower • 1s Drive Up',
      cues: ['Feet shoulder-width apart', 'Sit hips down & back', 'Chest tall, drive through midfoot'],
      angleTarget: '90° Parallel Depth',
    };
  }
  if (n.includes('lunge')) {
    return {
      category: 'lunge',
      duration: 14,
      primaryMuscle: 'Quadriceps, Glutes & Hamstrings',
      activeJoints: 'Bilateral Knees & Hips',
      tempo: '2s Step Back • 1s Drive Up',
      cues: ['Front knee directly over midfoot', 'Rear knee lowers toward floor', 'Torso stays strictly vertical'],
      angleTarget: '90° / 90° Knee Angles',
    };
  }
  if (n.includes('glute bridge') || n.includes('bridge')) {
    return {
      category: 'glute_bridge',
      duration: 12,
      primaryMuscle: 'Gluteus Maximus & Hamstrings',
      activeJoints: 'Hips, Knees',
      tempo: '1s Drive • 2s Squeeze • 2s Lower',
      cues: ['Drive through heels', 'Full hip extension at top', 'Avoid hyperextending lumbar spine'],
      angleTarget: '180° Shoulder-to-Knee Line',
    };
  }
  if (n.includes('superman') || n.includes('extension')) {
    return {
      category: 'superman',
      duration: 12,
      primaryMuscle: 'Erector Spinae & Posterior Chain',
      activeJoints: 'Spinal Extension',
      tempo: '1s Lift • 2s Hold • 1s Lower',
      cues: ['Lie prone, arms outstretched', 'Lift chest & thighs synchronously', 'Gaze down to protect neck'],
      angleTarget: 'Peak Contraction Hold',
    };
  }
  if (n.includes('climber') || n.includes('mountain')) {
    return {
      category: 'climbers',
      duration: 10,
      primaryMuscle: 'Transverse Abdominis & Hip Flexors',
      activeJoints: 'Hips, Core',
      tempo: 'Rhythmic Controlled Alternation',
      cues: ['Hands planted firmly beneath shoulders', 'Drive knees towards chest', 'Keep hips level, do not bounce'],
      angleTarget: 'Steady Core Stability',
    };
  }
  if (n.includes('bench') || n.includes('floor press')) {
    return {
      category: 'bench_press',
      duration: 14,
      primaryMuscle: 'Pectoralis Major & Triceps',
      activeJoints: 'Shoulders, Elbows',
      tempo: '2s Lower • 1s Drive to Lockout',
      cues: ['Retract shoulder blades into floor', 'Lower weights with 45° elbow tuck', 'Press vertically over chest line'],
      angleTarget: '90° Bottom Arm Angle',
    };
  }
  if (n.includes('row')) {
    return {
      category: 'bent_row',
      duration: 12,
      primaryMuscle: 'Latissimus Dorsi & Rhomboids',
      activeJoints: 'Shoulders, Elbows, Scapulae',
      tempo: '1s Pull • 1s Squeeze • 2s Lower',
      cues: ['Hinge 45° at hips with flat back', 'Pull elbows back grazing ribs', 'Squeeze shoulder blades together'],
      angleTarget: '45° Torso Incline',
    };
  }
  if (n.includes('overhead') || n.includes('shoulder press')) {
    return {
      category: 'overhead_press',
      duration: 12,
      primaryMuscle: 'Anterior & Lateral Deltoids',
      activeJoints: 'Shoulders, Elbows',
      tempo: '1s Press • 2s Controlled Lower',
      cues: ['Brace core to prevent back arch', 'Press dumbbells straight overhead', 'Lower to chin height under control'],
      angleTarget: '180° Overhead Vertical Lock',
    };
  }
  if (n.includes('rdl') || n.includes('deadlift')) {
    return {
      category: 'rdl',
      duration: 14,
      primaryMuscle: 'Hamstrings & Gluteus Maximus',
      activeJoints: 'Hips (Hinge)',
      tempo: '3s Hinge Back • 1s Snap Forward',
      cues: ['Slight soft bend in knees', 'Push hips back horizontally', 'Weights stay glued close to shins'],
      angleTarget: 'Pure Hip Hinge Mechanism',
    };
  }
  if (n.includes('curl') || n.includes('bicep')) {
    return {
      category: 'bicep_curl',
      duration: 12,
      primaryMuscle: 'Biceps Brachii & Brachialis',
      activeJoints: 'Elbow Flexion',
      tempo: '1s Curl • 1s Peak Squeeze • 2s Eccentric',
      cues: ['Elbows pinned to side ribcage', 'Zero body swing or momentum', 'Full extension at the bottom'],
      angleTarget: '135° Peak Elbow Flexion',
    };
  }
  if (n.includes('pulldown') || n.includes('pull')) {
    return {
      category: 'lat_pulldown',
      duration: 12,
      primaryMuscle: 'Latissimus Dorsi & Biceps',
      activeJoints: 'Shoulder Adduction, Elbows',
      tempo: '1s Pull • 1s Squeeze • 2s Return',
      cues: ['Drive elbows down and back', 'Pull bar smoothly to upper clavicle', 'Control the upward stretch'],
      angleTarget: 'Full Latissimus Engagement',
    };
  }
  if (n.includes('leg press')) {
    return {
      category: 'leg_press',
      duration: 12,
      primaryMuscle: 'Quadriceps & Glutes',
      activeJoints: 'Knees, Hips',
      tempo: '2s Lower • 1s Drive Out',
      cues: ['Feet shoulder-width on sled', 'Lower until knees reach 90°', 'Do not lock out knees at top'],
      angleTarget: '90° Safe Knee Angle',
    };
  }

  // Fallback profile based on target muscle
  return {
    category: 'generic',
    duration: 12,
    primaryMuscle: targetMuscle || 'Primary Working Muscle',
    activeJoints: 'Functional Movement System',
    tempo: '2s Controlled Movement • 1s Hold',
    cues: ['Maintain steady core engagement', 'Controlled smooth tempo throughout', 'Breathe out on peak exertion'],
    angleTarget: 'Controlled Biomechanics',
  };
}

export const ExerciseInstructionVideo: React.FC<ExerciseInstructionVideoProps> = ({
  exerciseName,
  targetMuscle = 'Target Area',
  instructions = '',
}) => {
  const profile = getExerciseProfile(exerciseName, targetMuscle);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeCueIdx, setActiveCueIdx] = useState<number>(0);

  const animFrameRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);

  // Playback timer loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      if (isPlaying) {
        const speed = isSlowMo ? 0.5 : 1.0;
        setCurrentTime((prev) => {
          const next = prev + delta * speed;
          if (next >= profile.duration) {
            return 0; // seamless loop
          }
          return next;
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, isSlowMo, profile.duration]);

  // Update active form cue based on cycle phase
  useEffect(() => {
    const cycleProgress = (currentTime % profile.duration) / profile.duration;
    if (cycleProgress < 0.33) setActiveCueIdx(0);
    else if (cycleProgress < 0.66) setActiveCueIdx(1);
    else setActiveCueIdx(2);
  }, [currentTime, profile.duration]);

  // Canvas 60fps Biomechanical Character Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dynamic canvas resolution scaling
    const width = canvas.width;
    const height = canvas.height;

    // Clear frame
    ctx.clearRect(0, 0, width, height);

    // Dark high-tech background with grid
    ctx.fillStyle = '#060a16';
    ctx.fillRect(0, 0, width, height);

    // Radial depth glow behind athlete
    const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.45);
    grad.addColorStop(0, 'rgba(239, 35, 60, 0.12)');
    grad.addColorStop(1, 'rgba(6, 10, 22, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Floor perspective grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const floorY = height * 0.78;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.stroke();

    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x + (x - width / 2) * 0.4, height);
      ctx.stroke();
    }

    // Rep cycle progress (0 to 1)
    const repDuration = profile.category === 'plank' ? 10 : 3.5;
    const repPhase = (currentTime % repDuration) / repDuration; // 0 to 1
    // Smooth cosine wave: 0 (start) -> 1 (peak depth) -> 0 (finish)
    const t = (1 - Math.cos(repPhase * Math.PI * 2)) / 2;

    // Phase label
    const isEccentric = repPhase < 0.5;
    const phaseLabel = profile.category === 'plank'
      ? 'ISOMETRIC HOLD'
      : isEccentric
      ? 'ECCENTRIC (LOWER)'
      : 'CONCENTRIC (DRIVE)';

    // Styling constants
    const avatarColor = '#e2e8f0';
    const jointColor = '#ffffff';
    const accentRed = '#ef233c';
    const guideArrowColor = 'rgba(239, 35, 60, 0.85)';

    ctx.save();

    // Helper functions for drawing
    const drawJoint = (x: number, y: number, r: number = 3.5, active: boolean = false) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = active ? accentRed : jointColor;
      ctx.fill();
      if (active) {
        ctx.strokeStyle = 'rgba(239, 35, 60, 0.4)';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    };

    const drawBone = (x1: number, y1: number, x2: number, y2: number, width: number = 4.5, isTarget: boolean = false) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isTarget ? accentRed : avatarColor;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    const drawHead = (x: number, y: number, r: number = 10) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();
      // Eye visor line
      ctx.beginPath();
      ctx.arc(x, y, r + 1, -0.2, 0.4);
      ctx.strokeStyle = accentRed;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawVectorArrow = (fromX: number, fromY: number, toX: number, toY: number, label: string = '') => {
      ctx.strokeStyle = guideArrowColor;
      ctx.fillStyle = guideArrowColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - 7 * Math.cos(angle - Math.PI / 6), toY - 7 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - 7 * Math.cos(angle + Math.PI / 6), toY - 7 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      if (label) {
        ctx.font = 'bold 9px monospace';
        ctx.fillText(label, toX + 6, toY + 3);
      }
    };

    const drawDumbbell = (x: number, y: number, angle: number = 0) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-10, -3, 20, 6);
      ctx.fillStyle = '#ef233c';
      ctx.fillRect(-12, -8, 4, 16);
      ctx.fillRect(8, -8, 4, 16);
      ctx.restore();
    };

    // Render Specific Exercise Avatar Kinematics
    const cx = width / 2;

    switch (profile.category) {
      case 'pushup': {
        // Floor level
        const groundY = floorY - 6;
        // Feet on floor at left
        const footX = cx - 80;
        const footY = groundY;
        // Hands on floor at right
        const handX = cx + 45;
        const handY = groundY;

        // Descent depth
        const drop = t * 24; // chest drops down
        const headX = handX + 16;
        const headY = groundY - 45 + drop;
        const shoulderX = handX;
        const shoulderY = groundY - 40 + drop;
        const hipX = cx - 25;
        const hipY = groundY - 26 + drop * 0.7;

        // Elbow position bends outward
        const elbowX = handX - 12 - t * 8;
        const elbowY = (shoulderY + handY) / 2 + 10;

        // Draw body lines
        drawBone(footX, footY, hipX, hipY, 5); // legs
        drawBone(hipX, hipY, shoulderX, shoulderY, 6, true); // braced core / chest
        drawHead(headX, headY, 9);
        drawBone(shoulderX, shoulderY, elbowX, elbowY, 4, true); // upper arm
        drawBone(elbowX, elbowY, handX, handY, 4); // forearm

        drawJoint(footX, footY, 3);
        drawJoint(hipX, hipY, 4);
        drawJoint(shoulderX, shoulderY, 4.5, true);
        drawJoint(elbowX, elbowY, 3.5, true);
        drawJoint(handX, handY, 3);

        // Motion vector
        if (isEccentric) {
          drawVectorArrow(shoulderX, shoulderY - 14, shoulderX, shoulderY - 2, 'LOWER');
        } else {
          drawVectorArrow(shoulderX, shoulderY + 8, shoulderX, shoulderY - 12, 'PRESS');
        }
        break;
      }

      case 'incline_pushup': {
        const groundY = floorY - 6;
        const benchX = cx + 55;
        const benchY = groundY - 35;
        // Bench platform
        ctx.fillStyle = '#334155';
        ctx.fillRect(benchX - 8, benchY, 26, 35);

        const footX = cx - 75;
        const footY = groundY;
        const drop = t * 20;

        const shoulderX = benchX - 10;
        const shoulderY = benchY - 12 + drop;
        const hipX = cx - 25;
        const hipY = groundY - 22 + drop * 0.6;
        const headX = shoulderX + 14;
        const headY = shoulderY - 10;

        const elbowX = shoulderX - 10;
        const elbowY = (shoulderY + benchY) / 2 + 8;

        drawBone(footX, footY, hipX, hipY, 5);
        drawBone(hipX, hipY, shoulderX, shoulderY, 6, true);
        drawHead(headX, headY, 9);
        drawBone(shoulderX, shoulderY, elbowX, elbowY, 4, true);
        drawBone(elbowX, elbowY, benchX, benchY, 4);

        drawJoint(footX, footY, 3);
        drawJoint(hipX, hipY, 4);
        drawJoint(shoulderX, shoulderY, 4, true);
        drawJoint(elbowX, elbowY, 3.5);
        drawJoint(benchX, benchY, 3);
        break;
      }

      case 'plank': {
        const groundY = floorY - 6;
        const footX = cx - 70;
        const footY = groundY;
        const elbowX = cx + 45;
        const elbowY = groundY;

        // Subtle breathing micro-pulse
        const pulse = Math.sin(currentTime * 3) * 1.5;
        const hipX = cx - 15;
        const hipY = groundY - 20 + pulse;
        const shoulderX = elbowX;
        const shoulderY = groundY - 26 + pulse;
        const headX = shoulderX + 16;
        const headY = shoulderY;

        // Draw perfect horizontal alignment
        drawBone(footX, footY, hipX, hipY, 5);
        drawBone(hipX, hipY, shoulderX, shoulderY, 6, true); // target core
        drawBone(shoulderX, shoulderY, elbowX, elbowY, 5);
        drawBone(elbowX, elbowY, elbowX + 18, elbowY, 4);
        drawHead(headX, headY, 9);

        drawJoint(footX, footY, 3);
        drawJoint(hipX, hipY, 4, true);
        drawJoint(shoulderX, shoulderY, 4);
        drawJoint(elbowX, elbowY, 4);

        // Core tension pulse wave
        ctx.strokeStyle = 'rgba(239, 35, 60, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(footX, footY - 4);
        ctx.lineTo(headX, shoulderY - 4);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'squat': {
        const groundY = floorY - 4;
        const footX = cx - 18;
        const footY = groundY;
        const footX2 = cx + 18;

        // Depth drop
        const depth = t * 38;
        const hipX = cx - t * 14;
        const hipY = groundY - 80 + depth;

        // Knees push forward and outward
        const kneeX = cx + 8;
        const kneeY = groundY - 38 + depth * 0.35;

        // Torso inclines slightly forward
        const shoulderX = cx + 4 - t * 8;
        const shoulderY = hipY - 48;
        const headX = shoulderX;
        const headY = shoulderY - 14;

        // Draw legs
        drawBone(footX, footY, kneeX - 8, kneeY, 5, true);
        drawBone(kneeX - 8, kneeY, hipX, hipY, 6, true); // quad
        drawBone(footX2, footY, kneeX + 8, kneeY, 5, true);
        drawBone(kneeX + 8, kneeY, hipX, hipY, 6, true);

        // Draw torso & head
        drawBone(hipX, hipY, shoulderX, shoulderY, 7);
        drawHead(headX, headY, 10);

        // Arms (goblet or bodyweight counter-balance)
        if (profile.category === 'squat' && exerciseName.toLowerCase().includes('goblet')) {
          drawBone(shoulderX, shoulderY, shoulderX + 10, shoulderY + 22, 4);
          drawDumbbell(shoulderX + 12, shoulderY + 20, Math.PI / 2);
        } else {
          drawBone(shoulderX, shoulderY, shoulderX + 24, shoulderY + 8, 4);
        }

        drawJoint(kneeX - 8, kneeY, 4, true);
        drawJoint(hipX, hipY, 4.5, true);
        drawJoint(shoulderX, shoulderY, 4);

        // Parallel indicator at bottom
        if (t > 0.8) {
          ctx.strokeStyle = 'rgba(239, 35, 60, 0.7)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(hipX - 20, hipY);
          ctx.lineTo(kneeX + 30, kneeY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (isEccentric) {
          drawVectorArrow(hipX - 18, hipY - 20, hipX - 18, hipY + 5, 'SIT BACK');
        } else {
          drawVectorArrow(hipX - 18, hipY + 5, hipX - 18, hipY - 20, 'DRIVE UP');
        }
        break;
      }

      case 'lunge': {
        const groundY = floorY - 4;
        const drop = t * 26;

        // Front leg (stationary)
        const frontFootX = cx + 28;
        const frontFootY = groundY;
        const frontKneeX = cx + 28;
        const frontKneeY = groundY - 32 + drop * 0.2;

        // Rear leg (stepped back)
        const rearFootX = cx - 55;
        const rearFootY = groundY;
        const rearKneeX = cx - 25;
        const rearKneeY = groundY - 36 + drop;

        const hipX = cx - 5;
        const hipY = groundY - 74 + drop;
        const shoulderX = hipX;
        const shoulderY = hipY - 46;
        const headX = shoulderX;
        const headY = shoulderY - 14;

        // Bones
        drawBone(frontFootX, frontFootY, frontKneeX, frontKneeY, 5, true);
        drawBone(frontKneeX, frontKneeY, hipX, hipY, 6, true);
        drawBone(rearFootX, rearFootY, rearKneeX, rearKneeY, 4);
        drawBone(rearKneeX, rearKneeY, hipX, hipY, 5);

        drawBone(hipX, hipY, shoulderX, shoulderY, 7);
        drawHead(headX, headY, 9);

        // Arms at side
        drawBone(shoulderX, shoulderY, shoulderX + 2, shoulderY + 28, 4);

        drawJoint(frontKneeX, frontKneeY, 4, true);
        drawJoint(rearKneeX, rearKneeY, 3.5);
        drawJoint(hipX, hipY, 4.5);
        break;
      }

      case 'glute_bridge': {
        const groundY = floorY - 4;
        const headX = cx - 60;
        const headY = groundY - 8;
        const shoulderX = cx - 45;
        const shoulderY = groundY - 6;

        const footX = cx + 45;
        const footY = groundY;

        // Hip thrust upward
        const thrust = t * 32;
        const hipX = cx + 5;
        const hipY = groundY - 10 - thrust;
        const kneeX = cx + 38;
        const kneeY = groundY - 36 - thrust * 0.4;

        drawBone(shoulderX, shoulderY, hipX, hipY, 6, true); // core & glutes
        drawBone(hipX, hipY, kneeX, kneeY, 5, true); // hamstrings
        drawBone(kneeX, kneeY, footX, footY, 5);
        drawHead(headX, headY, 9);

        drawJoint(footX, footY, 3);
        drawJoint(kneeX, kneeY, 4);
        drawJoint(hipX, hipY, 4.5, true);
        drawJoint(shoulderX, shoulderY, 3.5);

        if (!isEccentric) {
          drawVectorArrow(hipX, hipY + 14, hipX, hipY - 10, 'SQUEEZE');
        }
        break;
      }

      case 'bent_row': {
        const groundY = floorY - 4;
        const footX = cx - 15;
        const footY = groundY;
        const kneeX = cx - 8;
        const kneeY = groundY - 40;
        const hipX = cx - 25;
        const hipY = groundY - 70;

        // Torso hinged 45°
        const shoulderX = cx + 18;
        const shoulderY = hipY - 25;
        const headX = shoulderX + 10;
        const headY = shoulderY - 8;

        // Row motion (pull to hip)
        const rowT = t * 24;
        const handX = cx + 12 - rowT * 0.4;
        const handY = groundY - 28 - rowT;
        const elbowX = shoulderX - 10 - rowT * 0.5;
        const elbowY = shoulderY - 5 - rowT * 0.8;

        drawBone(footX, footY, kneeX, kneeY, 5);
        drawBone(kneeX, kneeY, hipX, hipY, 5);
        drawBone(hipX, hipY, shoulderX, shoulderY, 7, true); // lats
        drawHead(headX, headY, 9);

        // Arms pulling
        drawBone(shoulderX, shoulderY, elbowX, elbowY, 4.5, true);
        drawBone(elbowX, elbowY, handX, handY, 4);
        drawDumbbell(handX, handY);

        drawJoint(kneeX, kneeY, 4);
        drawJoint(hipX, hipY, 4.5);
        drawJoint(shoulderX, shoulderY, 4);
        drawJoint(elbowX, elbowY, 4, true);

        if (!isEccentric) {
          drawVectorArrow(handX, handY + 12, elbowX, elbowY, 'PULL');
        }
        break;
      }

      case 'bicep_curl': {
        const groundY = floorY - 4;
        const footX = cx;
        const footY = groundY;
        const hipX = cx;
        const hipY = groundY - 75;
        const shoulderX = cx;
        const shoulderY = hipY - 48;
        const headX = cx;
        const headY = shoulderY - 14;

        // Stationary elbow pinned to side
        const elbowX = cx + 4;
        const elbowY = shoulderY + 28;

        // Hand curls upward in arc
        const curlAngle = -Math.PI / 2 + t * (Math.PI * 0.72);
        const forearmLen = 26;
        const handX = elbowX + Math.sin(curlAngle) * forearmLen;
        const handY = elbowY - Math.cos(curlAngle) * forearmLen;

        drawBone(footX - 8, footY, hipX - 4, hipY, 5);
        drawBone(footX + 8, footY, hipX + 4, hipY, 5);
        drawBone(hipX, hipY, shoulderX, shoulderY, 7);
        drawHead(headX, headY, 9);

        // Upper arm (still) & forearm (rotating)
        drawBone(shoulderX, shoulderY, elbowX, elbowY, 5, true); // bicep
        drawBone(elbowX, elbowY, handX, handY, 4);
        drawDumbbell(handX, handY, curlAngle);

        drawJoint(elbowX, elbowY, 4, true);
        drawJoint(shoulderX, shoulderY, 4);

        if (!isEccentric) {
          drawVectorArrow(handX - 10, handY + 10, handX, handY - 6, 'CURL');
        }
        break;
      }

      case 'overhead_press': {
        const groundY = floorY - 4;
        const footX = cx;
        const footY = groundY;
        const hipX = cx;
        const hipY = groundY - 75;
        const shoulderX = cx;
        const shoulderY = hipY - 48;
        const headX = cx;
        const headY = shoulderY - 14;

        // Press upward
        const pressHeight = (1 - t) * 35; // t=0 is top, t=1 is bottom
        const handX = cx + 18;
        const handY = shoulderY - 10 - pressHeight;
        const elbowX = cx + 22;
        const elbowY = (shoulderY + handY) / 2 + 10;

        drawBone(footX - 8, footY, hipX - 4, hipY, 5);
        drawBone(footX + 8, footY, hipX + 4, hipY, 5);
        drawBone(hipX, hipY, shoulderX, shoulderY, 7);
        drawHead(headX, headY, 9);

        drawBone(shoulderX, shoulderY, elbowX, elbowY, 4.5, true); // deltoid
        drawBone(elbowX, elbowY, handX, handY, 4);
        drawDumbbell(handX, handY);

        drawJoint(shoulderX, shoulderY, 4, true);
        drawJoint(elbowX, elbowY, 3.5);

        if (isEccentric) {
          drawVectorArrow(handX + 12, handY - 15, handX + 12, handY + 10, 'CONTROL');
        } else {
          drawVectorArrow(handX + 12, handY + 10, handX + 12, handY - 15, 'PRESS');
        }
        break;
      }

      default: {
        // High-fidelity versatile generic kinematic model for any custom exercise
        const groundY = floorY - 4;
        const wave = Math.sin(repPhase * Math.PI * 2);
        const shiftY = wave * 16;

        const footX = cx;
        const footY = groundY;
        const hipX = cx;
        const hipY = groundY - 70 + shiftY * 0.4;
        const shoulderX = cx;
        const shoulderY = hipY - 46;
        const headX = cx;
        const headY = shoulderY - 14;

        drawBone(footX - 10, footY, hipX - 4, hipY, 5);
        drawBone(footX + 10, footY, hipX + 4, hipY, 5);
        drawBone(hipX, hipY, shoulderX, shoulderY, 7, true);
        drawHead(headX, headY, 9);

        // Arms moving symmetrically
        const armWave = Math.cos(repPhase * Math.PI * 2) * 20;
        drawBone(shoulderX, shoulderY, shoulderX + 22, shoulderY + 20 + armWave, 4, true);
        drawBone(shoulderX, shoulderY, shoulderX - 22, shoulderY + 20 + armWave, 4, true);

        drawJoint(hipX, hipY, 4);
        drawJoint(shoulderX, shoulderY, 4.5, true);
        break;
      }
    }

    ctx.restore();

    // Visual HUD Overlays on Canvas
    // Top-left: Movement phase badge
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = isEccentric ? '#38bdf8' : '#ef233c';
    ctx.fillText(`● ${phaseLabel}`, 12, 18);

    // Top-right: Joint alignment angle
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText(profile.angleTarget, width - 12, 18);
    ctx.textAlign = 'left';

    // Target muscle group label
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(`TARGET: ${profile.primaryMuscle}`, 12, height - 12);
  }, [currentTime, profile, exerciseName]);

  const progressPercent = Math.min(100, (currentTime / profile.duration) * 100);

  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/90 overflow-hidden shadow-lg transition-all">
      {/* Video Header Strip */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#ef233c]/20 border border-[#ef233c]/40 flex items-center justify-center text-[#ef233c]">
            <Sparkles className="w-3 h-3" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-manrope">AI Form Instruction Video</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ef233c]/20 text-[#ef233c] font-mono font-bold">
                12s HD LOOP
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Slow-mo form review toggle */}
          <button
            type="button"
            onClick={() => setIsSlowMo(!isSlowMo)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition border ${
              isSlowMo
                ? 'bg-[#ef233c] text-white border-red-500'
                : 'bg-white/5 text-zinc-400 hover:text-white border-white/10'
            }`}
            title="Toggle 0.5x Slow-Motion for Form Check"
          >
            {isSlowMo ? '0.5x SLOW' : '1.0x'}
          </button>

          {/* Compact / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded transition"
            title={isExpanded ? 'Collapse video' : 'Expand video'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Video Viewport Canvas */}
      <div className="relative w-full overflow-hidden bg-black select-none">
        <canvas
          ref={canvasRef}
          width={480}
          height={isExpanded ? 240 : 160}
          className="w-full h-auto block object-cover"
        />

        {/* Video Scrubber & Play Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2.5 pt-4">
          {/* Progress Bar (Scrubber) */}
          <div
            className="w-full h-1 bg-white/20 hover:h-2 rounded-full cursor-pointer relative mb-2 transition-all group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              setCurrentTime(clickPos * profile.duration);
            }}
          >
            <div
              className="h-full bg-[#ef233c] rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute -right-1.5 -top-1 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-6 h-6 rounded-full bg-[#ef233c] text-white flex items-center justify-center hover:bg-red-600 transition shadow"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => setCurrentTime(0)}
                className="p-1 hover:text-white transition"
                title="Restart Rep Cycle"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <span>
                {formatTime(currentTime)} / {formatTime(profile.duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400 font-manrope hidden sm:inline">
                Tempo: <span className="text-white font-mono">{profile.tempo}</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                LOOP ON
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Key Technique Cue Strip */}
      <div className="px-3.5 py-2 bg-zinc-950/90 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ef233c] shrink-0" />
          <span className="text-[11px] text-zinc-400 font-manrope">
            Key Form Cue: <strong className="text-white">{profile.cues[activeCueIdx]}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
          {profile.cues.map((cue, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveCueIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeCueIdx === idx ? 'bg-[#ef233c] w-4' : 'bg-white/20 hover:bg-white/40'
              }`}
              title={cue}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
