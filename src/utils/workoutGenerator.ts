import { WorkoutDayPlan, WorkoutExercise } from '../../server/db';

export interface WorkoutGeneratorInput {
  goal: 'maintain_weight' | 'lose_weight' | 'gain_weight' | 'improve_general_fitness';
  experience: 'beginner' | 'intermediate' | 'advanced';
  equipment: 'full_gym' | 'dumbbells' | 'resistance_bands' | 'home_no_equipment';
  workoutDaysPerWeek: number; // 1-7
  availableMinutes: number; // 30, 45, 60
}

interface ExerciseLibraryItem {
  id: string;
  name: string;
  targetMuscle: string;
  equipment: 'gym' | 'dumbbells' | 'bands' | 'bodyweight';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  defaultSets: number;
  defaultReps: string;
  restSeconds: number;
  instructions: string;
}

export const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  // Bodyweight / Home
  {
    id: 'bw-squat',
    name: 'Bodyweight Squats',
    targetMuscle: 'Quadriceps, Glutes',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12-15 reps',
    restSeconds: 60,
    instructions: 'Stand tall with feet shoulder-width. Lower hips back and down until thighs are parallel to the floor, driving knees out.',
  },
  {
    id: 'bw-pushup',
    name: 'Standard Push-ups',
    targetMuscle: 'Chest, Shoulders, Triceps',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '8-12 reps',
    restSeconds: 60,
    instructions: 'Keep body in a tight plank line. Lower chest until it hovers an inch above floor, elbows at ~45 degrees.',
  },
  {
    id: 'bw-incline-pushup',
    name: 'Incline / Knee Push-ups',
    targetMuscle: 'Chest & Core',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSeconds: 60,
    instructions: 'Hands placed on an elevated surface like a bench or bed to reduce load while perfecting push mechanics.',
  },
  {
    id: 'bw-glute-bridge',
    name: 'Glute Bridges',
    targetMuscle: 'Glutes, Hamstrings',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '15 reps',
    restSeconds: 45,
    instructions: 'Lie on your back with knees bent and feet flat. Drive through heels to raise your hips until knees, hips and shoulders form a line.',
  },
  {
    id: 'bw-lunges',
    name: 'Walking or Reverse Lunges',
    targetMuscle: 'Quads, Glutes, Hamstrings',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10 each leg',
    restSeconds: 60,
    instructions: 'Step back smoothly, lowering rear knee towards floor while front shin remains vertical.',
  },
  {
    id: 'bw-plank',
    name: 'Forearm Plank Hold',
    targetMuscle: 'Core, Abdominals, Shoulders',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '30-45 secs',
    restSeconds: 60,
    instructions: 'Rest on elbows directly under shoulders. Squeeze glutes and brace core as if bracing for a punch.',
  },
  {
    id: 'bw-pike-pushup',
    name: 'Pike Push-ups',
    targetMuscle: 'Shoulders, Triceps',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '8-10 reps',
    restSeconds: 75,
    instructions: 'From a downward dog position, bend elbows to lower crown of head toward floor, pressing back up.',
  },
  {
    id: 'bw-superman',
    name: 'Superman Back Extensions',
    targetMuscle: 'Erector Spinae, Posterior Chain',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12 reps',
    restSeconds: 45,
    instructions: 'Lie prone face down. Lift chest and legs slightly off floor, holding peak contraction for 2 seconds.',
  },
  {
    id: 'bw-mountain-climbers',
    name: 'Mountain Climbers',
    targetMuscle: 'Cardio & Abdominals',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '30 secs',
    restSeconds: 45,
    instructions: 'In a tall plank, drive knees alternately toward chest in a smooth, rhythmic sprint.',
  },

  // Dumbbell Exercises
  {
    id: 'db-goblet-squat',
    name: 'Dumbbell Goblet Squat',
    targetMuscle: 'Quads, Glutes, Core',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSeconds: 75,
    instructions: 'Hold dumbbell vertically against chest. Squat between knees keeping torso tall.',
  },
  {
    id: 'db-bench-press',
    name: 'Dumbbell Floor / Bench Press',
    targetMuscle: 'Chest, Triceps',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSeconds: 75,
    instructions: 'Lie on bench or carpet floor. Press dumbbells up until arms are extended, lower slowly with control.',
  },
  {
    id: 'db-bent-row',
    name: 'Dumbbell Bent-Over Row',
    targetMuscle: 'Lats, Rhomboids, Biceps',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSeconds: 60,
    instructions: 'Hinge forward at hips with flat back. Pull dumbbells to sides of ribcage, squeezing shoulder blades.',
  },
  {
    id: 'db-overhead-press',
    name: 'Dumbbell Overhead Shoulder Press',
    targetMuscle: 'Deltoids, Triceps',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10 reps',
    restSeconds: 75,
    instructions: 'Press dumbbells vertically overhead without arching lower back. Control descent.',
  },
  {
    id: 'db-rdl',
    name: 'Dumbbell Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings, Glutes, Lower Back',
    equipment: 'dumbbells',
    difficulty: 'intermediate',
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSeconds: 75,
    instructions: 'Keep slight bend in knees, push hips back horizontally until feeling stretch in hamstrings.',
  },
  {
    id: 'db-bicep-curl',
    name: 'Dumbbell Bicep Curls',
    targetMuscle: 'Biceps, Forearms',
    equipment: 'dumbbells',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '12 reps',
    restSeconds: 45,
    instructions: 'Pin elbows to your ribs and curl weights smoothly without swinging torso.',
  },

  // Gym / Resistance Bands equivalents
  {
    id: 'gym-lat-pulldown',
    name: 'Lat Pulldown / Band Pulls',
    targetMuscle: 'Latissimus Dorsi',
    equipment: 'gym',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSeconds: 60,
    instructions: 'Pull bar or band smoothly to upper chest, retracting shoulder blades.',
  },
  {
    id: 'gym-leg-press',
    name: 'Leg Press Machine',
    targetMuscle: 'Quads, Glutes',
    equipment: 'gym',
    difficulty: 'beginner',
    defaultSets: 3,
    defaultReps: '10-12 reps',
    restSeconds: 75,
    instructions: 'Lower sled until knees reach 90 degrees, press smoothly through midfoot and heels.',
  },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function generatePersonalizedWorkout(input: WorkoutGeneratorInput): WorkoutDayPlan[] {
  const daysPerWeek = Math.min(7, Math.max(1, input.workoutDaysPerWeek));

  // Determine workout days indices
  const activeDayIndices: number[] = [];
  if (daysPerWeek === 1) activeDayIndices.push(0); // Mon
  else if (daysPerWeek === 2) activeDayIndices.push(0, 3); // Mon, Thu
  else if (daysPerWeek === 3) activeDayIndices.push(0, 2, 4); // Mon, Wed, Fri
  else if (daysPerWeek === 4) activeDayIndices.push(0, 1, 3, 4); // Mon, Tue, Thu, Fri
  else if (daysPerWeek === 5) activeDayIndices.push(0, 1, 2, 3, 4); // Mon-Fri
  else if (daysPerWeek === 6) activeDayIndices.push(0, 1, 2, 3, 4, 5); // Mon-Sat
  else activeDayIndices.push(0, 1, 2, 3, 4, 5, 6);

  // Filter exercises suitable for equipment
  const equipKey = input.equipment === 'full_gym' ? 'gym' : input.equipment === 'dumbbells' ? 'dumbbells' : input.equipment === 'resistance_bands' ? 'bands' : 'bodyweight';

  const getSuitableExercises = (category: string) => {
    let pool = EXERCISE_LIBRARY.filter((ex) => {
      if (equipKey === 'bodyweight') return ex.equipment === 'bodyweight';
      if (equipKey === 'dumbbells') return ex.equipment === 'dumbbells' || ex.equipment === 'bodyweight';
      return true;
    });

    if (category === 'upper') {
      return pool.filter((e) => e.targetMuscle.includes('Chest') || e.targetMuscle.includes('Shoulders') || e.targetMuscle.includes('Lats') || e.targetMuscle.includes('Biceps'));
    }
    if (category === 'lower') {
      return pool.filter((e) => e.targetMuscle.includes('Quads') || e.targetMuscle.includes('Glutes') || e.targetMuscle.includes('Hamstrings'));
    }
    if (category === 'core') {
      return pool.filter((e) => e.targetMuscle.includes('Core') || e.targetMuscle.includes('Abdominals') || e.targetMuscle.includes('Cardio'));
    }
    return pool;
  };

  const toWorkoutExercise = (item: ExerciseLibraryItem): WorkoutExercise => {
    // Adjust sets according to experience
    const sets = input.experience === 'advanced' ? item.defaultSets + 1 : item.defaultSets;
    return {
      id: `${item.id}-${Math.random().toString(36).substring(2, 6)}`,
      name: item.name,
      targetMuscle: item.targetMuscle,
      sets,
      reps: item.defaultReps,
      restSeconds: item.restSeconds,
      estimatedMinutes: Math.round((sets * (45 + item.restSeconds)) / 60) + 2,
      instructions: item.instructions,
      equipmentNeeded: item.equipment === 'bodyweight' ? 'None (Bodyweight)' : item.equipment === 'dumbbells' ? 'Pair of Dumbbells' : 'Gym Equipment',
      completed: false,
    };
  };

  const schedule: WorkoutDayPlan[] = DAYS.map((dayName, idx) => {
    const isActive = activeDayIndices.includes(idx);
    if (!isActive) {
      return {
        dayName,
        focus: 'Active Rest & Recovery',
        isRestDay: true,
        exercises: [],
        estimatedTotalMinutes: 0,
      };
    }

    // Split scheme
    let focus = 'Full Body Conditioning';
    const exercises: WorkoutExercise[] = [];

    if (daysPerWeek >= 4) {
      const activeOrder = activeDayIndices.indexOf(idx);
      if (activeOrder % 2 === 0) {
        focus = 'Upper Body Strength & Posture';
        const upperList = getSuitableExercises('upper');
        const coreList = getSuitableExercises('core');
        upperList.slice(0, 3).forEach((e) => exercises.push(toWorkoutExercise(e)));
        if (coreList[0]) exercises.push(toWorkoutExercise(coreList[0]));
      } else {
        focus = 'Lower Body & Core Mobility';
        const lowerList = getSuitableExercises('lower');
        const coreList = getSuitableExercises('core');
        lowerList.slice(0, 3).forEach((e) => exercises.push(toWorkoutExercise(e)));
        if (coreList[1]) exercises.push(toWorkoutExercise(coreList[1]));
      }
    } else {
      focus = `Full Body Circuit (${idx === 0 ? 'A' : idx === 2 ? 'B' : 'C'})`;
      const lower = getSuitableExercises('lower')[0];
      const upperPush = getSuitableExercises('upper')[0];
      const upperPull = getSuitableExercises('upper')[1];
      const core = getSuitableExercises('core')[0];

      if (lower) exercises.push(toWorkoutExercise(lower));
      if (upperPush) exercises.push(toWorkoutExercise(upperPush));
      if (upperPull) exercises.push(toWorkoutExercise(upperPull));
      if (core) exercises.push(toWorkoutExercise(core));
    }

    const estimatedTotalMinutes = exercises.reduce((acc, e) => acc + e.estimatedMinutes, 0);

    return {
      dayName,
      focus,
      isRestDay: false,
      exercises,
      estimatedTotalMinutes: Math.min(input.availableMinutes || 45, Math.max(25, estimatedTotalMinutes)),
    };
  });

  return schedule;
}
