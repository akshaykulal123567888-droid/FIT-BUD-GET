import { DailyRoutineEvent } from '../../server/db';

export interface RoutineGeneratorInput {
  wakeTime: string; // '07:00'
  sleepTime: string; // '22:30'
  workStartTime: string; // '09:00'
  workEndTime: string; // '17:00'
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening' | 'night';
  workoutDurationMinutes: number; // 45
}

function timeToMinutes(t: string): number {
  const [h, m] = (t || '07:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(mins: number): string {
  let m = mins % (24 * 60);
  if (m < 0) m += 24 * 60;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

export function generateDailyRoutine(input: RoutineGeneratorInput): DailyRoutineEvent[] {
  const wakeMins = timeToMinutes(input.wakeTime);
  const sleepMins = timeToMinutes(input.sleepTime);
  const workStartMins = timeToMinutes(input.workStartTime);
  const workEndMins = timeToMinutes(input.workEndTime);

  const events: DailyRoutineEvent[] = [];

  // 1. Wake up
  events.push({
    id: 'r-wake',
    time: input.wakeTime,
    title: 'Wake Up & Morning Hydration',
    type: 'wake',
    description: 'Drink 2 glasses (500ml) of room-temperature or warm water. Gentle light stretching.',
  });

  // Determine workout time
  let workoutMins = workEndMins + 45; // default evening
  if (input.preferredWorkoutTime === 'morning') {
    workoutMins = wakeMins + 40;
  } else if (input.preferredWorkoutTime === 'afternoon') {
    workoutMins = workStartMins + 240; // midday break
  } else if (input.preferredWorkoutTime === 'night') {
    workoutMins = sleepMins - 150;
  } else {
    // evening
    workoutMins = Math.max(workEndMins + 30, wakeMins + 600);
  }

  // 2. Breakfast (approx 30 mins after wake, or after workout if morning workout)
  const breakfastMins = input.preferredWorkoutTime === 'morning' ? workoutMins + input.workoutDurationMinutes + 20 : wakeMins + 35;
  events.push({
    id: 'r-bfast',
    time: minutesToTime(breakfastMins),
    title: 'Breakfast & Sustained Fuel',
    type: 'meal',
    description: 'Protein & complex carbs to fuel mental focus and energy.',
  });

  // 3. Work/College Block 1
  if (workStartMins > breakfastMins) {
    events.push({
      id: 'r-work1',
      time: input.workStartTime,
      title: 'Work / Study Productivity Block',
      type: 'work',
      description: 'High priority tasks. Keep water bottle nearby and stand/stretch every 50 minutes.',
    });
  }

  // 4. Mid-morning snack
  const midMorningMins = Math.round((breakfastMins + workStartMins + 240) / 2);
  events.push({
    id: 'r-snack1',
    time: minutesToTime(breakfastMins + 180),
    title: 'Mid-Morning Snack & Hydration',
    type: 'snack',
    description: 'High-protein snack (peanuts/chana) + 300ml water.',
  });

  // 5. Lunch
  const lunchMins = Math.min(workEndMins - 120, Math.max(breakfastMins + 300, 780)); // around 1:00 PM
  events.push({
    id: 'r-lunch',
    time: minutesToTime(lunchMins),
    title: 'Balanced Lunch',
    type: 'meal',
    description: 'Wholesome lunch with lentils, grains, greens and curd.',
  });

  // 6. Pre-workout / Afternoon snack
  if (input.preferredWorkoutTime !== 'morning') {
    const preWorkoutMins = workoutMins - 35;
    events.push({
      id: 'r-snack2',
      time: minutesToTime(preWorkoutMins),
      title: 'Pre-Workout Energizer',
      type: 'snack',
      description: 'Light snack for sustained stamina and workout readiness.',
    });
  }

  // 7. Workout
  events.push({
    id: 'r-workout',
    time: minutesToTime(workoutMins),
    title: 'Scheduled Workout Session',
    type: 'workout',
    description: `${input.workoutDurationMinutes} mins active training. Track your sets, reps, and stay hydrated.`,
  });

  // 8. Dinner
  const dinnerMins = Math.min(sleepMins - 120, workoutMins + input.workoutDurationMinutes + 75);
  events.push({
    id: 'r-dinner',
    time: minutesToTime(dinnerMins),
    title: 'Nutritious Dinner',
    type: 'meal',
    description: 'Lean protein, clean carbs and vegetables. Kept 2 hours before sleep for optimal digestion.',
  });

  // 9. Wind-down
  const windDownMins = sleepMins - 45;
  events.push({
    id: 'r-winddown',
    time: minutesToTime(windDownMins),
    title: 'Evening Wind-Down & Check-In',
    type: 'winddown',
    description: 'Dim lights, log daily check-in on FitBudget, reflect on wins and prepare clothes for tomorrow.',
  });

  // 10. Sleep
  events.push({
    id: 'r-sleep',
    time: input.sleepTime,
    title: 'Restful Sleep Target',
    type: 'sleep',
    description: '7.5 – 8 hours of restorative sleep for hormone balance, muscle recovery, and mental clarity.',
  });

  // Sort chronologically from wake
  events.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  return events;
}
