import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Clock,
  Flame,
  Zap,
  ChevronDown,
  ChevronUp,
  Award,
  ListPlus,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export interface WorkoutTimerProps {
  // Optional active exercise context
  activeExerciseName?: string;
  // External rest trigger (e.g. triggered from an exercise card)
  requestedRestSeconds?: number | null;
  onRestRequestedHandled?: () => void;
  onSetLogged?: (exerciseName: string, durationSeconds: number) => void;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  activeExerciseName,
  requestedRestSeconds,
  onRestRequestedHandled,
  onSetLogged,
}) => {
  // Mode: 'rest' for interval countdown, 'exercise' for active set & session duration tracking
  const [activeTab, setActiveTab] = useState<'rest' | 'exercise'>('rest');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // ---------- REST TIMER STATE ----------
  const [restInitial, setRestInitial] = useState<number>(60);
  const [restRemaining, setRestRemaining] = useState<number>(60);
  const [isRestRunning, setIsRestRunning] = useState<boolean>(false);
  const [restAlert, setRestAlert] = useState<boolean>(false);

  // ---------- EXERCISE & SESSION STOPWATCH STATE ----------
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [isSessionRunning, setIsSessionRunning] = useState<boolean>(false);

  const [setSeconds, setSetSeconds] = useState<number>(0);
  const [isSetRunning, setIsSetRunning] = useState<boolean>(false);
  const [loggedSets, setLoggedSets] = useState<{ id: string; exercise: string; duration: number; timestamp: string }[]>([]);

  // Sound chime synthesizer via Web Audio API
  const playChime = (type: 'finish' | 'tick' | 'start') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'finish') {
        // High double-tone chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // AudioContext unavailable or blocked by autoplay policy
    }
  };

  // External rest interval request handler
  useEffect(() => {
    if (requestedRestSeconds && requestedRestSeconds > 0) {
      setRestInitial(requestedRestSeconds);
      setRestRemaining(requestedRestSeconds);
      setIsRestRunning(true);
      setActiveTab('rest');
      setRestAlert(false);
      playChime('start');
      if (onRestRequestedHandled) onRestRequestedHandled();
    }
  }, [requestedRestSeconds]);

  // REST COUNTDOWN EFFECT
  useEffect(() => {
    let interval: any = null;
    if (isRestRunning && restRemaining > 0) {
      interval = setInterval(() => {
        setRestRemaining((prev) => {
          if (prev <= 1) {
            setIsRestRunning(false);
            setRestAlert(true);
            playChime('finish');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestRunning, restRemaining, soundEnabled]);

  // SESSION STOPWATCH EFFECT
  useEffect(() => {
    let interval: any = null;
    if (isSessionRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionRunning]);

  // ACTIVE SET STOPWATCH EFFECT
  useEffect(() => {
    let interval: any = null;
    if (isSetRunning) {
      interval = setInterval(() => {
        setSetSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSetRunning]);

  // Rest Timer Controls
  const toggleRest = () => {
    if (!isRestRunning) {
      if (restRemaining === 0) {
        setRestRemaining(restInitial);
      }
      playChime('start');
      setIsRestRunning(true);
      setRestAlert(false);
    } else {
      setIsRestRunning(false);
    }
  };

  const resetRest = () => {
    setIsRestRunning(false);
    setRestRemaining(restInitial);
    setRestAlert(false);
  };

  const adjustRest = (delta: number) => {
    setRestRemaining((prev) => Math.max(5, prev + delta));
    setRestInitial((prev) => Math.max(5, prev + delta));
  };

  const selectRestPreset = (seconds: number) => {
    setRestInitial(seconds);
    setRestRemaining(seconds);
    setIsRestRunning(true);
    setRestAlert(false);
    playChime('start');
  };

  // Set & Session Controls
  const toggleSetTracker = () => {
    if (!isSetRunning) {
      setIsSetRunning(true);
      playChime('start');
      // If session isn't running yet, auto-start session
      if (!isSessionRunning) setIsSessionRunning(true);
    } else {
      setIsSetRunning(false);
    }
  };

  const logCurrentSet = () => {
    if (setSeconds === 0) return;
    const name = activeExerciseName || 'Exercise Set';
    const newEntry = {
      id: `set-${Date.now()}`,
      exercise: name,
      duration: setSeconds,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setLoggedSets((prev) => [newEntry, ...prev]);
    if (onSetLogged) onSetLogged(name, setSeconds);
    // Reset set stopwatch and auto-prompt rest interval
    setSetSeconds(0);
    setIsSetRunning(false);
    playChime('finish');
    // Offer quick transition to rest interval
    setActiveTab('rest');
    setRestRemaining(restInitial);
    setIsRestRunning(true);
  };

  const resetSetTracker = () => {
    setIsSetRunning(false);
    setSetSeconds(0);
  };

  const toggleSession = () => {
    setIsSessionRunning(!isSessionRunning);
  };

  const resetSession = () => {
    setIsSessionRunning(false);
    setSessionSeconds(0);
  };

  // Helper formatting mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format hours and mins
  const formatHourMinSec = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    return `${m}m ${s}s`;
  };

  // Circular progress calculations for Rest Countdown
  const progressRatio = restInitial > 0 ? restRemaining / restInitial : 0;
  const strokeDashoffset = 283 * (1 - progressRatio); // circumference of r=45 is ~282.7

  // Estimated calories burned during active session (~7.5 kcal / min of resistance training)
  const estimatedCaloriesBurned = Math.round((sessionSeconds / 60) * 7.5);

  return (
    <div className="w-full bg-zinc-950/95 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md transition-all">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 flex items-center justify-center font-bold">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white font-manrope">Workout Precision Timer</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
                Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-light">
              Rest intervals, exercise duration & active session pacing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs transition ${
              soundEnabled
                ? 'bg-zinc-800/70 border-zinc-700 text-zinc-200 hover:text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-400'
            }`}
            title={soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-zinc-800/70 border border-zinc-700 text-zinc-300 hover:text-white transition"
            title={isExpanded ? 'Collapse timer' : 'Expand timer'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsed State Summary Bar */}
      {!isExpanded && (
        <div className="px-5 py-3 flex items-center justify-between text-xs bg-zinc-950">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium">Rest Timer:</span>
              <span className={`font-mono font-bold ${restRemaining === 0 ? 'text-emerald-400' : 'text-[#ef233c]'}`}>
                {formatTime(restRemaining)}
              </span>
              <button
                onClick={toggleRest}
                className="px-2 py-1 bg-[#ef233c] text-white rounded-lg text-[10px] font-bold hover:bg-red-700 transition"
              >
                {isRestRunning ? 'Pause' : 'Start'}
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 border-l border-zinc-800 pl-4">
              <span className="text-zinc-400 font-medium">Session:</span>
              <span className="font-mono font-bold text-white">{formatTime(sessionSeconds)}</span>
              <span className="text-[10px] text-zinc-500">({estimatedCaloriesBurned} kcal)</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
          >
            <span>Open Full Controls</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Expanded Controls Body */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Tabs: Rest Interval vs Exercise Duration */}
          <div className="flex items-center bg-black/60 p-1.5 rounded-2xl border border-zinc-800/80 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('rest')}
              className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                activeTab === 'rest'
                  ? 'bg-[#ef233c] text-white shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Rest Interval Countdown</span>
              {isRestRunning && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('exercise')}
              className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                activeTab === 'exercise'
                  ? 'bg-[#ef233c] text-white shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Exercise Duration & Sets</span>
              {isSetRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB 1: REST COUNTDOWN */}
          {activeTab === 'rest' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Radial Countdown Gauge */}
              <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-zinc-800/80"
                    />
                    {/* Animated Progress ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray="283"
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className={`transition-all duration-500 ease-linear ${
                        restRemaining === 0
                          ? 'text-emerald-500'
                          : isRestRunning
                          ? 'text-[#ef233c]'
                          : 'text-amber-500'
                      }`}
                    />
                  </svg>

                  {/* Centered Digital Readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {isRestRunning ? 'Resting' : restRemaining === 0 ? 'Ready!' : 'Paused'}
                    </span>
                    <span
                      className={`text-4xl font-black font-mono tracking-tight my-1 ${
                        restRemaining === 0
                          ? 'text-emerald-400 animate-bounce'
                          : restRemaining <= 10 && isRestRunning
                          ? 'text-red-400 animate-pulse'
                          : 'text-white'
                      }`}
                    >
                      {formatTime(restRemaining)}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Target: {restInitial}s
                    </span>
                  </div>
                </div>

                {/* Rest Alert Toast */}
                {restAlert && (
                  <div className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Rest complete! Time for the next set!</span>
                  </div>
                )}
              </div>

              {/* Rest Controls & Preset Buttons */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    Quick Rest Presets
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[30, 45, 60, 90, 120].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => selectRestPreset(sec)}
                        className={`py-2 px-1 rounded-xl text-xs font-extrabold font-mono transition border ${
                          restInitial === sec
                            ? 'bg-[#ef233c]/20 border-[#ef233c] text-white shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={toggleRest}
                    className={`flex-1 py-3 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-lg active:scale-95 ${
                      isRestRunning
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                        : 'bg-[#ef233c] hover:bg-red-700 text-white shadow-red-600/30'
                    }`}
                  >
                    {isRestRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isRestRunning ? 'Pause Rest' : 'Start Rest'}</span>
                  </button>

                  <button
                    onClick={resetRest}
                    className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-2xl border border-zinc-800 transition"
                    title="Reset Countdown"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  {/* +/- 15s fine tuning */}
                  <div className="flex items-center bg-zinc-900 rounded-2xl border border-zinc-800 p-1">
                    <button
                      onClick={() => adjustRest(-15)}
                      className="px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition text-xs font-bold"
                      title="-15 seconds"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-zinc-500 font-mono px-1">15s</span>
                    <button
                      onClick={() => adjustRest(15)}
                      className="px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition text-xs font-bold"
                      title="+15 seconds"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Scientific rest: 45–60s for muscular endurance, 90–120s for hypertrophy, and 2–3 mins for heavy compound strength lifts.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXERCISE DURATION & SESSION STOPWATCH */}
          {activeTab === 'exercise' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Set Stopwatch */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Current Set Duration
                      </span>
                      <h4 className="text-sm font-extrabold text-white">
                        {activeExerciseName || 'Active Exercise Set'}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-bold font-mono">
                      {isSetRunning ? 'Timing...' : 'Idle'}
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-5xl font-black font-mono text-white tracking-tight">
                      {formatTime(setSeconds)}
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                      Measure time under tension (TUT) or timed holds
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSetTracker}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        isSetRunning
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      {isSetRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isSetRunning ? 'Pause Set' : 'Start Set Timer'}</span>
                    </button>

                    <button
                      onClick={logCurrentSet}
                      disabled={setSeconds === 0}
                      className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                      title="Log this set duration and start rest"
                    >
                      <ListPlus className="w-4 h-4" />
                      <span>Log Set</span>
                    </button>

                    <button
                      onClick={resetSetTracker}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition"
                      title="Reset Set Timer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Total Workout Session Stopwatch */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Total Session Elapsed
                      </span>
                      <h4 className="text-sm font-extrabold text-white">Workout Session</h4>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Flame className="w-3.5 h-3.5" />
                      <span>~{estimatedCaloriesBurned} kcal</span>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-5xl font-black font-mono text-zinc-100 tracking-tight">
                      {formatTime(sessionSeconds)}
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                      Total duration: {formatHourMinSec(sessionSeconds)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSession}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        isSessionRunning
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                      }`}
                    >
                      {isSessionRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isSessionRunning ? 'Pause Session' : 'Start Session'}</span>
                    </button>

                    <button
                      onClick={resetSession}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition"
                      title="Reset Session Stopwatch"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Logged Sets History in current workout */}
              {loggedSets.length > 0 && (
                <div className="bg-black/50 border border-zinc-800/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Completed Sets This Session ({loggedSets.length})</span>
                    </span>
                    <button
                      onClick={() => setLoggedSets([])}
                      className="text-[10px] text-zinc-500 hover:text-red-400 transition"
                    >
                      Clear Log
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 max-h-36 overflow-y-auto">
                    {loggedSets.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono"
                      >
                        <div className="truncate mr-2">
                          <span className="text-zinc-500 mr-1.5">#{loggedSets.length - idx}</span>
                          <span className="text-zinc-200 font-semibold">{entry.exercise}</span>
                        </div>
                        <span className="text-emerald-400 font-bold shrink-0">
                          {formatTime(entry.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
