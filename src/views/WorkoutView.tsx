import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Plus,
  ArrowRightLeft,
  Trash2,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WorkoutDayPlan, WorkoutExercise } from '../../server/db';
import { EXERCISE_LIBRARY } from '../utils/workoutGenerator';
import { ASSETS } from '../assets/images';
import { ExerciseInstructionVideo } from '../components/ExerciseInstructionVideo';
import { WorkoutTimer } from '../components/WorkoutTimer';

export const WorkoutView: React.FC = () => {
  const { user, updatePlan, todayLog, saveTodayLog } = useApp();

  const workoutSplit = user?.plan?.workoutSplit || [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(currentDayIndex);

  const activeDayPlan = workoutSplit[selectedDayIdx] || workoutSplit[0];

  // Rest & Exercise Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [timerInitial, setTimerInitial] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [requestedRestSeconds, setRequestedRestSeconds] = useState<number | null>(null);
  const [activeExerciseName, setActiveExerciseName] = useState<string>('');

  // Add Custom Exercise modal
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState<boolean>(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState('Core & Abs');
  const [customSets, setCustomSets] = useState(3);
  const [customReps, setCustomReps] = useState('12 reps');
  const [customRest, setCustomRest] = useState(60);
  const [customInstructions, setCustomInstructions] = useState('');

  // Replace Exercise modal
  const [replacingExerciseId, setReplacingExerciseId] = useState<string | null>(null);

  // Rest timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startTimer = (seconds: number, exerciseName?: string) => {
    setTimerInitial(seconds);
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
    setRequestedRestSeconds(seconds);
    if (exerciseName) {
      setActiveExerciseName(exerciseName);
    }
  };

  const handleToggleExerciseComplete = async (exerciseId: string) => {
    const updatedSplit = workoutSplit.map((day, idx) => {
      if (idx !== selectedDayIdx) return day;
      return {
        ...day,
        exercises: day.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
        ),
      };
    });

    await updatePlan({ workoutSplit: updatedSplit });

    const currentExercises = updatedSplit[selectedDayIdx]?.exercises || [];
    const allDone = currentExercises.length > 0 && currentExercises.every((e) => e.completed);
    if (allDone && selectedDayIdx === currentDayIndex) {
      await saveTodayLog({ workoutCompleted: true });
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    const updatedSplit = workoutSplit.map((day, idx) => {
      if (idx !== selectedDayIdx) return day;
      return {
        ...day,
        exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
      };
    });
    await updatePlan({ workoutSplit: updatedSplit });
  };

  const handleAddCustomExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newEx: WorkoutExercise = {
      id: `custom-${Date.now()}`,
      name: customName,
      targetMuscle: customMuscle,
      sets: customSets,
      reps: customReps,
      restSeconds: customRest,
      estimatedMinutes: Math.round((customSets * (45 + customRest)) / 60),
      instructions: customInstructions || 'Perform controlled movements keeping core braced throughout.',
      equipmentNeeded: 'None / User Choice',
      completed: false,
    };

    const updatedSplit = workoutSplit.map((day, idx) => {
      if (idx !== selectedDayIdx) return day;
      return {
        ...day,
        isRestDay: false,
        exercises: [...day.exercises, newEx],
        estimatedTotalMinutes: (day.estimatedTotalMinutes || 0) + newEx.estimatedMinutes,
      };
    });

    await updatePlan({ workoutSplit: updatedSplit });
    setIsAddExerciseModalOpen(false);
    setCustomName('');
  };

  const handleReplaceExerciseSubmit = async (replacementLibId: string) => {
    const libItem = EXERCISE_LIBRARY.find((e) => e.id === replacementLibId);
    if (!libItem || !replacingExerciseId) return;

    const updatedSplit = workoutSplit.map((day, idx) => {
      if (idx !== selectedDayIdx) return day;
      return {
        ...day,
        exercises: day.exercises.map((ex) => {
          if (ex.id !== replacingExerciseId) return ex;
          return {
            ...ex,
            name: libItem.name,
            targetMuscle: libItem.targetMuscle,
            sets: libItem.defaultSets,
            reps: libItem.defaultReps,
            restSeconds: libItem.restSeconds,
            instructions: libItem.instructions,
            equipmentNeeded: libItem.equipment === 'bodyweight' ? 'None (Bodyweight)' : 'Equipment Needed',
          };
        }),
      };
    });

    await updatePlan({ workoutSplit: updatedSplit });
    setReplacingExerciseId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-white selection-red">
      {/* 3D Gym Showcase Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-black border border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/3 opacity-25 md:opacity-40 pointer-events-none overflow-hidden">
          <img
            src={ASSETS.gym3D}
            alt="3D Gym Workout"
            className="w-full h-full object-cover object-center filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 rounded-md text-[10px] font-bold uppercase tracking-wider font-manrope">
              {user?.profile?.equipment ? user.profile.equipment.replace('_', ' ') : 'Home Workout'}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {user?.profile?.workoutDaysPerWeek || 4} Days / Week Schedule
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-manrope">
            Workout Progression & Sets
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
            Target muscles, rest timers, and progressive overload suited to your experience level ({user?.profile?.experience || 'Beginner'}).
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAddExerciseModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3 bg-[#ef233c] hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-red-600/30 transition active:scale-95 font-manrope"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Exercise</span>
          </button>
        </div>
      </div>

      {/* Days of Week Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((dayName, idx) => {
          const isToday = idx === currentDayIndex;
          const isSelected = idx === selectedDayIdx;
          const dayPlan = workoutSplit[idx];
          const isRest = dayPlan?.isRestDay || dayPlan?.exercises?.length === 0;

          return (
            <button
              key={dayName}
              onClick={() => setSelectedDayIdx(idx)}
              className={`px-4 py-3 rounded-2xl border text-left shrink-0 transition flex flex-col gap-0.5 min-w-[105px] font-manrope ${
                isSelected
                  ? 'bg-[#ef233c] text-white border-red-500 shadow-lg ring-2 ring-red-500/40 font-bold'
                  : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isSelected ? 'text-white/90' : 'text-zinc-500'}`}>
                  {isToday ? 'Today' : dayName.substring(0, 3)}
                </span>
                {isRest && (
                  <span className={`text-[9px] px-1 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    Rest
                  </span>
                )}
              </div>
              <span className="font-black text-xs">{dayName}</span>
              <span className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
                {isRest ? 'Recovery' : `${dayPlan?.exercises?.length || 0} exercises`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Day Banner */}
      <div className="bg-zinc-950/90 text-white rounded-3xl p-6 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#ef233c]/20 text-[#ef233c] border border-[#ef233c]/30 rounded-md text-[10px] font-bold uppercase tracking-wider font-manrope">
              {activeDayPlan?.dayName}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Est. Duration: {activeDayPlan?.estimatedTotalMinutes || 35} mins
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-manrope">{activeDayPlan?.focus}</h2>
          <p className="text-xs text-zinc-400 font-light">
            {activeDayPlan?.isRestDay
              ? 'Promotes neuromuscular recovery and glycogen replenishment. Light stretching or walking encouraged.'
              : 'Focus on full range of motion. Rest 60–90 seconds between sets for optimal strength output.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => startTimer(60, activeDayPlan?.focus || 'General Rest')}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs rounded-2xl flex items-center gap-2 transition"
          >
            <Timer className="w-4 h-4 text-[#ef233c]" />
            <span>Quick 60s Rest</span>
          </button>
        </div>
      </div>

      {/* Integrated Workout Timer (Rest Interval Countdown & Duration Tracker) */}
      <WorkoutTimer
        activeExerciseName={activeExerciseName}
        requestedRestSeconds={requestedRestSeconds}
        onRestRequestedHandled={() => setRequestedRestSeconds(null)}
      />

      {/* Exercises List */}
      {activeDayPlan?.isRestDay || activeDayPlan?.exercises?.length === 0 ? (
        <div className="bg-gradient-to-b from-[#0d1838] to-[#091228] rounded-3xl p-10 border border-[#192b57] text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-white text-base">Rest & Active Recovery Day</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Rest days are where muscles repair and grow stronger. Focus on hydration, meeting your protein target ({user?.profile?.calculatedMetrics?.targetProteinGrams || 85}g), and getting 7–8 hours of restful sleep.
          </p>
          <button
            onClick={() => setIsAddExerciseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#101e42] hover:bg-[#162754] text-slate-200 font-bold text-xs rounded-xl transition border border-[#1f356b]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add an exercise to today</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeDayPlan.exercises.map((exercise, index) => {
            const isCompleted = exercise.completed || false;
            return (
              <div
                key={exercise.id}
                className={`rounded-3xl border transition shadow-md overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-500/50 bg-[#0a1f2e]'
                    : 'bg-gradient-to-b from-[#0d1838] to-[#091228] border-[#192b57]'
                }`}
              >
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-[#070e22] text-slate-300 font-black text-xs flex items-center justify-center border border-[#17254a]">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-white text-base">{exercise.name}</h4>
                        <span className="text-[11px] text-blue-400 font-bold">
                          Target: {exercise.targetMuscle}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 bg-[#070e22] font-bold text-slate-200 rounded-lg border border-[#17254a]">
                        {exercise.sets} Sets
                      </span>
                      <span className="px-2.5 py-1 bg-[#070e22] font-bold text-slate-200 rounded-lg border border-[#17254a]">
                        {exercise.reps}
                      </span>
                      <button
                        onClick={() => startTimer(exercise.restSeconds || 60, exercise.name)}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-[#ef233c] border border-red-500/30 font-bold rounded-lg flex items-center gap-1 transition"
                        title={`Start ${exercise.restSeconds || 60}s rest timer for ${exercise.name}`}
                      >
                        <Timer className="w-3 h-3 text-[#ef233c]" />
                        <span>{exercise.restSeconds || 60}s Rest</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-[#070e22] rounded-2xl border border-[#17254a] text-xs text-slate-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{exercise.instructions}</span>
                  </div>

                  {/* AI-Generated Instructional Exercise Video */}
                  <ExerciseInstructionVideo
                    exerciseName={exercise.name}
                    targetMuscle={exercise.targetMuscle}
                    instructions={exercise.instructions}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#17254a] text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReplacingExerciseId(exercise.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white font-semibold transition"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Swap</span>
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-rose-400 font-semibold transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Skip</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleExerciseComplete(exercise.id)}
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          : 'bg-[#101e42] hover:bg-[#162754] text-slate-200 border border-[#1f356b]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Exercise Modal */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          <div className="w-full max-w-md bg-[#0b142d] rounded-3xl p-6 shadow-2xl border border-[#1b2b54] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">Add Exercise</h3>
              <button
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomExerciseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pull-ups, Bulgarian Split Squats"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl font-semibold text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Muscle Group</label>
                <input
                  type="text"
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={customSets}
                    onChange={(e) => setCustomSets(parseInt(e.target.value, 10) || 3)}
                    className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Reps</label>
                  <input
                    type="text"
                    value={customReps}
                    onChange={(e) => setCustomReps(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Rest (s)</label>
                  <input
                    type="number"
                    step="15"
                    value={customRest}
                    onChange={(e) => setCustomRest(parseInt(e.target.value, 10) || 60)}
                    className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Form Instructions (optional)</label>
                <textarea
                  rows={2}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExerciseModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace Exercise Selector Modal */}
      {replacingExerciseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          <div className="w-full max-w-lg bg-[#0b142d] rounded-3xl p-6 shadow-2xl border border-[#1b2b54] space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#17254a]">
              <h3 className="font-extrabold text-base text-white">Choose Replacement Exercise</h3>
              <button
                onClick={() => setReplacingExerciseId(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {EXERCISE_LIBRARY.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleReplaceExerciseSubmit(item.id)}
                  className="p-3 rounded-2xl border border-[#17254a] hover:border-blue-500 bg-[#070e22] cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-white">{item.name}</h5>
                    <span className="text-[11px] text-slate-400">
                      {item.targetMuscle} • {item.equipment}
                    </span>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white font-extrabold rounded-lg text-[11px]">
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
