import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNavBox } from './components/BottomNavBox';
import { DisclaimerModal } from './components/DisclaimerModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { AnalyzeFoodModal } from './components/AnalyzeFoodModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PresentationSlidesModal } from './components/PresentationSlidesModal';

// Views
import { HomePage } from './views/HomePage';
import { DietView } from './views/DietView';
import { WorkoutView } from './views/WorkoutView';
import { RoutineView } from './views/RoutineView';
import { ProgressView } from './views/ProgressView';
import { FoodsView } from './views/FoodsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { user, activeTab, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center selection-red">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ef233c] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-zinc-400 tracking-wider font-manrope">Loading FitBudget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-inter relative overflow-x-hidden flex flex-col justify-between pb-24 sm:pb-28">
      {/* Global Ambient Fitness Theme Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1511]/50 via-transparent to-[#06100c]/80"></div>
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]"></div>
        <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_80s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#a4ff78]/5 rounded-full blur-[140px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_80%)]"></div>
      </div>

      {/* Top Gradient Blur */}
      <div className="gradient-blur"></div>

      {/* Top Floating Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className={`relative z-10 w-full flex-1 ${activeTab === 'home' || !user?.profile ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'}`}>
        {(!user || !user.profile || activeTab === 'home') && <HomePage />}
        {user?.profile && activeTab === 'diet' && <DietView />}
        {user?.profile && activeTab === 'workout' && <WorkoutView />}
        {user?.profile && activeTab === 'routine' && <RoutineView />}
        {user?.profile && activeTab === 'progress' && <ProgressView />}
        {user?.profile && activeTab === 'foods' && <FoodsView />}
        {user?.profile && activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Persistent Bottom Navigation Dock */}
      <BottomNavBox />

      {/* Global Interactive Modals */}
      <DailyCheckInModal />
      <AnalyzeFoodModal />
      <OnboardingModal />
      <PresentationSlidesModal />
      <DisclaimerModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
