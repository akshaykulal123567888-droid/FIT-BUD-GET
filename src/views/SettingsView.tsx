import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  RefreshCw,
  User,
  HeartPulse,
  Send,
  HelpCircle,
  Edit2,
  X,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { requestNotificationPermission } from '../utils/notifications';
import { NotificationSettings, UserProfile } from '../../server/db';
import { EditBudgetModal } from '../components/EditBudgetModal';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateNotificationSettings,
    triggerTestNotification,
    setIsDisclaimerModalOpen,
    setIsOnboardingOpen,
    loadDemoUser,
    updateAccount,
    updateProfile,
    regenerateAllPlans,
    startNewProfileCreation,
    logout,
    currency,
  } = useApp();

  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Edit Form State
  const profile = user?.profile;
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editAge, setEditAge] = useState(profile?.age || 22);
  const [editHeightCm, setEditHeightCm] = useState(profile?.heightCm || 172);
  const [editWeightKg, setEditWeightKg] = useState(profile?.weightKg || 68);
  const [editGender, setEditGender] = useState(profile?.gender || 'male');
  const [editActivity, setEditActivity] = useState(profile?.activityLevel || 'moderately_active');
  const [editGoal, setEditGoal] = useState(profile?.goal || 'maintain_weight');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  const initialNotifs: NotificationSettings = user?.notificationSettings || {
    enabled: true,
    breakfastReminder: true,
    breakfastTime: '07:15',
    lunchReminder: true,
    lunchTime: '12:45',
    dinnerReminder: true,
    dinnerTime: '20:00',
    snackReminder: true,
    workoutReminder: true,
    workoutTime: '17:45',
    waterReminder: true,
    checkInReminder: true,
    checkInTime: '21:30',
    sleepReminder: true,
    sleepTime: '22:15',
    weeklyProgress: true,
  };

  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(initialNotifs);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      triggerTestNotification('🔔 Notifications Enabled!', 'You will receive reminders for meals, workouts & hydration.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSavingProfile(true);
    try {
      if (editName.trim()) {
        await updateAccount(editName.trim(), editEmail.trim());
      }
      const updatedProfile: UserProfile = {
        ...profile,
        age: editAge,
        heightCm: editHeightCm,
        weightKg: editWeightKg,
        gender: editGender as any,
        activityLevel: editActivity as any,
        goal: editGoal as any,
      };
      await regenerateAllPlans(updatedProfile, editName.trim(), editEmail.trim());
      setProfileSuccessMsg('Profile updated and nutritional blueprint recalculated!');
      setTimeout(() => {
        setProfileSuccessMsg('');
        setIsEditingProfile(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    await updateNotificationSettings(notifSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/user/export', {
        method: 'POST',
        headers: { 'x-user-id': user?.id || 'demo-user-123' },
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FitBudget-Export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset your account data? This will restore initial sample records.')) {
      await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || 'demo-user-123' },
      });
      await loadDemoUser();
      alert('Data reset successfully.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Profile & Account Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personalize your identity, body metrics, nutrition targets, reminders, and data privacy.
          </p>
        </div>

        <button
          onClick={startNewProfileCreation}
          className="self-start sm:self-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Make New Profile</span>
        </button>
      </div>

      {/* Demo Profile Notice Banner */}
      {user?.isDemo && (
        <div className="p-4 bg-gradient-to-r from-blue-900/30 via-[#0d1736] to-[#070d1e] rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-white">You are viewing the Sample Demo Profile</h4>
              <p className="text-[11px] text-slate-400">Make your own personal profile with your exact age, weight, height, and custom food budget.</p>
            </div>
          </div>
          <button
            onClick={startNewProfileCreation}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 shrink-0"
          >
            Create My Profile
          </button>
        </div>
      )}

      {/* User Profile Card */}
      <div className="bg-[#0d1736] rounded-3xl p-6 border border-[#1b2b54] shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2b54]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg">{user?.name || 'Athlete'}</h3>
                {user?.isDemo ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                    Demo Mode
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    Personal Profile
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{user?.email || 'No email attached'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingProfile ? (
              <button
                onClick={() => {
                  setEditName(user?.name || '');
                  setEditEmail(user?.email || '');
                  setEditAge(profile?.age || 22);
                  setEditHeightCm(profile?.heightCm || 172);
                  setEditWeightKg(profile?.weightKg || 68);
                  setEditGender(profile?.gender || 'male');
                  setEditActivity(profile?.activityLevel || 'moderately_active');
                  setEditGoal(profile?.goal || 'maintain_weight');
                  setIsEditingProfile(true);
                }}
                className="px-4 py-2 bg-[#0e1a3a] hover:bg-[#16254c] text-white font-bold text-xs rounded-xl border border-[#1b2b54] transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 bg-[#0e1a3a] hover:bg-[#16254c] text-slate-300 font-bold text-xs rounded-xl border border-[#1b2b54] transition flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}

            <button
              onClick={startNewProfileCreation}
              className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold text-xs rounded-xl transition"
            >
              Re-run Setup Wizard
            </button>
          </div>
        </div>

        {/* Inline Profile Editing Form */}
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 bg-[#070d1e]/80 p-5 rounded-2xl border border-[#1b2b54]">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
              Edit Your Profile Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl font-bold text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age (yrs)</label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={editAge}
                    onChange={(e) => setEditAge(parseInt(e.target.value, 10) || 20)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl font-bold text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e: any) => setEditGender(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="240"
                    value={editHeightCm}
                    onChange={(e) => setEditHeightCm(parseInt(e.target.value, 10) || 170)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl font-bold text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="35"
                    max="250"
                    value={editWeightKg}
                    onChange={(e) => setEditWeightKg(parseFloat(e.target.value) || 65)}
                    className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl font-bold text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Activity Level</label>
                <select
                  value={editActivity}
                  onChange={(e: any) => setEditActivity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="sedentary">Sedentary (Desk work, little exercise)</option>
                  <option value="lightly_active">Lightly Active (1–3 exercise days/wk)</option>
                  <option value="moderately_active">Moderately Active (3–5 exercise days/wk)</option>
                  <option value="very_active">Very Active (6–7 heavy exercise days/wk)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Fitness Goal</label>
                <select
                  value={editGoal}
                  onChange={(e: any) => setEditGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070d1e] border border-[#1b2b54] rounded-xl text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="lose_weight">Lose Weight (Safe Calorie Deficit)</option>
                  <option value="maintain_weight">Maintain Weight</option>
                  <option value="gain_weight">Gain Weight / Muscle (Safe Surplus)</option>
                  <option value="improve_general_fitness">Improve General Fitness & Energy</option>
                </select>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 bg-[#0e1a3a] text-slate-300 font-bold text-xs rounded-xl border border-[#1b2b54]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/30 transition"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile & Recalculate Blueprint'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#070d1e] rounded-xl border border-[#1b2b54]">
              <span className="text-[10px] text-slate-500 block font-semibold">Body Metrics</span>
              <span className="font-bold text-slate-200">
                {profile?.age} yrs • {profile?.heightCm} cm • {profile?.weightKg} kg
              </span>
            </div>
            <div className="p-3 bg-[#070d1e] rounded-xl border border-[#1b2b54]">
              <span className="text-[10px] text-slate-500 block font-semibold">Current Goal</span>
              <span className="font-bold text-white capitalize">{profile?.goal?.replace('_', ' ')}</span>
            </div>
            <div className="p-3 bg-[#070d1e] rounded-xl border border-[#1b2b54]">
              <span className="text-[10px] text-slate-500 block font-semibold">Diet Preference</span>
              <span className="font-bold text-white capitalize">{profile?.foodPreference?.replace('_', ' ')}</span>
            </div>
            <div className="p-3 bg-[#070d1e] rounded-xl border border-[#1b2b54] flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">Daily Food Budget</span>
                <span className="font-bold text-emerald-400">{currency}{profile?.budgetAmount}/day</span>
              </div>
              <button
                onClick={() => setIsEditBudgetOpen(true)}
                className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 underline underline-offset-2 text-left mt-1"
              >
                Change Budget
              </button>
            </div>
          </div>
        )}

        {/* Calculated Targets Overview */}
        <div className="p-4 bg-[#070d1e] rounded-2xl border border-[#1b2b54] space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Current Estimated Scientific Targets
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-[#0a1329] rounded-xl border border-[#1b2b54]">
              <span className="text-[10px] text-slate-500 block">BMI (Informational)</span>
              <span className="text-base font-black text-white">{profile?.calculatedMetrics?.bmi || 22.5}</span>
            </div>
            <div className="p-2.5 bg-[#0a1329] rounded-xl border border-[#1b2b54]">
              <span className="text-[10px] text-slate-500 block">Resting BMR</span>
              <span className="text-base font-black text-white">{profile?.calculatedMetrics?.bmr || 1650} kcal</span>
            </div>
            <div className="p-2.5 bg-[#0a1329] rounded-xl border border-[#1b2b54]">
              <span className="text-[10px] text-slate-500 block">Daily Calorie Target</span>
              <span className="text-base font-black text-emerald-400">{profile?.calculatedMetrics?.targetCalories || 2100} kcal</span>
            </div>
            <div className="p-2.5 bg-[#0a1329] rounded-xl border border-[#1b2b54]">
              <span className="text-[10px] text-slate-500 block">Target Protein</span>
              <span className="text-base font-black text-blue-400">{profile?.calculatedMetrics?.targetProteinGrams || 95}g /day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications & Reminders Setup */}
      <div className="bg-[#0d1736] rounded-3xl p-6 border border-[#1b2b54] shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b54]">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-white text-base">Notifications & Daily Reminders</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your alert times for meals, workouts, water, and evening check-ins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {browserPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                Enable Browser Alerts
              </button>
            )}
            <button
              onClick={() => triggerTestNotification('🧪 Test Alert', 'This is a test notification from FitBudget!')}
              className="px-3 py-1.5 bg-[#0e1a3a] hover:bg-[#16254c] text-slate-200 font-semibold text-xs rounded-xl border border-[#1b2b54] transition flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Test Ping</span>
            </button>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 bg-[#070d1e] rounded-2xl border border-[#1b2b54]">
          <div>
            <span className="font-bold text-white text-xs">Enable Scheduled In-App & Browser Reminders</span>
            <p className="text-[11px] text-slate-400">Mutes all alarms if turned off.</p>
          </div>
          <input
            type="checkbox"
            checked={notifSettings.enabled}
            onChange={(e) => setNotifSettings({ ...notifSettings, enabled: e.target.checked })}
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Individual Reminder Controls */}
        <div className="space-y-3 text-xs">
          {[
            { key: 'breakfastReminder', timeKey: 'breakfastTime', label: '🍳 Breakfast Reminder', defaultTime: '07:15' },
            { key: 'lunchReminder', timeKey: 'lunchTime', label: '🥗 Lunch Reminder', defaultTime: '12:45' },
            { key: 'dinnerReminder', timeKey: 'dinnerTime', label: '🍲 Dinner Reminder', defaultTime: '20:00' },
            { key: 'workoutReminder', timeKey: 'workoutTime', label: '🏋️ Workout Session Reminder', defaultTime: '17:45' },
            { key: 'checkInReminder', timeKey: 'checkInTime', label: '📊 Daily Check-in Reminder', defaultTime: '21:30' },
            { key: 'sleepReminder', timeKey: 'sleepTime', label: '😴 Sleep & Wind-Down Reminder', defaultTime: '22:15' },
          ].map((item) => (
            <div
              key={item.key}
              className="p-3 rounded-2xl border border-[#1b2b54] bg-[#070d1e]/80 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={(notifSettings as any)[item.key]}
                  onChange={(e) =>
                    setNotifSettings({ ...notifSettings, [item.key]: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <span className="font-bold text-slate-200">{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">Scheduled Time:</span>
                <input
                  type="time"
                  value={(notifSettings as any)[item.timeKey] || item.defaultTime}
                  onChange={(e) =>
                    setNotifSettings({ ...notifSettings, [item.timeKey]: e.target.value })
                  }
                  className="px-2 py-1 bg-[#070d1e] border border-[#1b2b54] rounded-lg text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveNotifications}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccess ? 'Saved Successfully!' : 'Save Notification Preferences'}</span>
          </button>
        </div>
      </div>

      {/* Privacy, Export & Data Control */}
      <div className="bg-[#0d1736] rounded-3xl p-6 border border-[#1b2b54] shadow-md space-y-4">
        <div className="flex items-center gap-2 text-white font-extrabold text-base">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Privacy & Personal Data Controls</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          FitBudget gives you complete sovereignty over your wellness data. You can download all your logged check-ins, custom prices, and meal plans in a clean JSON format at any time, or permanently erase your data.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="px-4 py-2.5 bg-[#0e1a3a] hover:bg-[#16254c] text-white font-bold text-xs rounded-xl border border-[#1b2b54] transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>{isExporting ? 'Preparing Export...' : 'Export My Personal Data (JSON)'}</span>
          </button>

          <button
            onClick={() => setIsDisclaimerModalOpen(true)}
            className="px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs rounded-xl border border-blue-500/30 transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>View Medical & Wellness Disclaimer</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Reset Demo Data / Clear Cache</span>
          </button>
        </div>
      </div>

      {/* Edit Budget Modal */}
      <EditBudgetModal isOpen={isEditBudgetOpen} onClose={() => setIsEditBudgetOpen(false)} />
    </div>
  );
};
