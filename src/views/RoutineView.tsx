import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Edit2,
  Plus,
  Trash2,
  Sparkles,
  Sun,
  Coffee,
  Briefcase,
  Utensils,
  Dumbbell,
  Moon,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DailyRoutineEvent } from '../../server/db';

export const RoutineView: React.FC = () => {
  const { user, updatePlan, todayLog, saveTodayLog } = useApp();

  const routine = user?.plan?.dailyRoutine || [];
  const completedEvents = todayLog.routineEventsCompleted || [];

  const [editingEvent, setEditingEvent] = useState<DailyRoutineEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('16:00');
  const [newType, setNewType] = useState<DailyRoutineEvent['type']>('snack');
  const [newDescription, setNewDescription] = useState('');

  const toggleEventComplete = async (eventId: string) => {
    const isCompleted = completedEvents.includes(eventId);
    const updated = isCompleted
      ? completedEvents.filter((id) => id !== eventId)
      : [...completedEvents, eventId];

    await saveTodayLog({ routineEventsCompleted: updated });
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    const updated = routine.map((ev) => (ev.id === editingEvent.id ? editingEvent : ev));
    updated.sort((a, b) => a.time.localeCompare(b.time));
    await updatePlan({ dailyRoutine: updated });
    setEditingEvent(null);
  };

  const handleRemoveEvent = async (id: string) => {
    const updated = routine.filter((ev) => ev.id !== id);
    await updatePlan({ dailyRoutine: updated });
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEv: DailyRoutineEvent = {
      id: `ev-${Date.now()}`,
      time: newTime,
      title: newTitle,
      type: newType,
      description: newDescription || 'Scheduled custom routine block.',
    };

    const updated = [...routine, newEv];
    updated.sort((a, b) => a.time.localeCompare(b.time));
    await updatePlan({ dailyRoutine: updated });

    setIsAddEventOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const getEventIcon = (type: DailyRoutineEvent['type']) => {
    switch (type) {
      case 'wake':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'meal':
        return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'snack':
        return <Coffee className="w-4 h-4 text-orange-400" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-purple-400" />;
      case 'winddown':
      case 'sleep':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-white selection-red">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-manrope">
            <span>Daily Integrated Schedule</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 rounded-md font-mono">
              {routine.length} Scheduled Events
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Combines meals, workouts, work productivity blocks, hydration, and sleep into a seamless 24-hour timeline.
          </p>
        </div>

        <button
          onClick={() => setIsAddEventOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#ef233c] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-600/30 transition active:scale-95 font-manrope"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Event</span>
        </button>
      </div>

      {/* Routine Timeline */}
      <div className="bg-zinc-950/80 rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl space-y-6">
        <div className="relative pl-6 sm:pl-8 border-l-2 border-zinc-800 space-y-6">
          {routine.map((event) => {
            const isDone = completedEvents.includes(event.id);
            return (
              <div key={event.id} className="relative group">
                <div
                  onClick={() => toggleEventComplete(event.id)}
                  className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 rounded-xl flex items-center justify-center cursor-pointer transition border ${
                    isDone
                      ? 'bg-[#ef233c] border-red-500 text-white shadow-md shadow-red-600/30 font-bold'
                      : 'bg-black border-zinc-800 hover:border-[#ef233c] text-zinc-400'
                  }`}
                  title={isDone ? 'Completed' : 'Click to mark completed'}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : getEventIcon(event.type)}
                </div>

                {/* Event Card */}
                <div
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-zinc-900/60 border-zinc-700 text-white'
                      : 'bg-black/80 border-zinc-800/80 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-white/5 text-[#ef233c] font-mono font-bold text-xs rounded-lg border border-white/10">
                        {event.time}
                      </span>
                      <h4 className={`font-extrabold text-sm font-manrope ${isDone ? 'text-zinc-400 line-through' : 'text-white'}`}>
                        {event.title}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 pl-0.5 font-light">{event.description}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                      title="Edit event time or details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveEvent(event.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition"
                      title="Remove event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          <div className="w-full max-w-sm bg-[#0b142d] rounded-3xl p-6 shadow-2xl border border-[#1b2b54] space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-white">Edit Schedule Event</h3>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Time</label>
              <input
                type="time"
                value={editingEvent.time}
                onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl font-bold text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Title</label>
              <input
                type="text"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl font-semibold text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={editingEvent.description}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Event Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          <div className="w-full max-w-sm bg-[#0b142d] rounded-3xl p-6 shadow-2xl border border-[#1b2b54] space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">Add Routine Event</h3>
              <button onClick={() => setIsAddEventOpen(false)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddEventSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Event Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl font-bold text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening Walk / Electrolytes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl font-semibold text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meal">Meal</option>
                  <option value="snack">Snack / Hydration</option>
                  <option value="workout">Workout / Activity</option>
                  <option value="work">Work / Study Block</option>
                  <option value="winddown">Wind Down / Recovery</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 15 minute post-dinner walk"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070e22] border border-[#17254a] rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
