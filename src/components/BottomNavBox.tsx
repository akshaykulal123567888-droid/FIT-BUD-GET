import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  Clock,
  LineChart,
  ShoppingBag,
  Camera,
  CheckCircle2,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItem {
  key: 'home' | 'diet' | 'workout' | 'routine' | 'progress' | 'foods' | 'settings';
  label: string;
  icon: React.ElementType;
}

export const BottomNavBox: React.FC = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    setIsCheckInModalOpen,
    setIsAnalyzeFoodModalOpen,
    loadDemoUser,
  } = useApp();

  const handleTabClick = async (key: 'home' | 'diet' | 'workout' | 'routine' | 'progress' | 'foods' | 'settings') => {
    if (!user || !user.profile) {
      await loadDemoUser();
    }
    setActiveTab(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: NavItem[] = [
    { key: 'home', label: 'Home', icon: LayoutDashboard },
    { key: 'diet', label: 'Diet', icon: UtensilsCrossed },
    { key: 'workout', label: 'Workout', icon: Dumbbell },
    { key: 'routine', label: 'Routine', icon: Clock },
    { key: 'progress', label: 'Progress', icon: LineChart },
    { key: 'foods', label: 'Foods', icon: ShoppingBag },
    { key: 'settings', label: 'Profile', icon: User },
  ];

  return (
    <aside
      aria-label="Bottom Navigation Box"
      className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-lg sm:max-w-none sm:w-auto pointer-events-auto"
    >
      {/* Mobile Top Quick Action Mini-Bar */}
      <div className="flex sm:hidden items-center justify-center gap-2 mb-1.5">
        <button
          type="button"
          onClick={() => setIsAnalyzeFoodModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#07100d]/90 text-[#a4ff78] border border-[#a4ff78]/30 text-[11px] font-bold shadow-lg backdrop-blur-md active:scale-95"
          title="Scan food photo with AI"
        >
          <Camera className="w-3.5 h-3.5 text-[#a4ff78]" />
          <span>Scan Food</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCheckInModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a4ff78] text-[#07100d] text-[11px] font-black shadow-lg shadow-[#a4ff78]/30 active:scale-95"
          title="Log daily check-in"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#07100d]" />
          <span>Daily Check-in</span>
        </button>
      </div>

      {/* Main Glassmorphic Navigation Box */}
      <div className="bg-[#07100d]/90 border border-white/10 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] rounded-2xl sm:rounded-full p-1 sm:p-2 ring-1 ring-white/5">
        {/* Mobile: Clean 7-Column Responsive Layout */}
        <div className="grid grid-cols-7 sm:hidden gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabClick(item.key)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition duration-150 active:scale-95 ${
                  isActive
                    ? 'bg-[#a4ff78] text-[#07100d] font-black shadow-md shadow-[#a4ff78]/35'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title={`Go to ${item.label}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#07100d]' : 'text-zinc-400'}`} />
                <span className="text-[9px] mt-0.5 font-bold tracking-tight leading-none truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Laptop / Desktop: Horizontal Unified Flex Capsule */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-1.5">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleTabClick(item.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 shrink-0 font-manrope ${
                    isActive
                      ? 'bg-[#a4ff78] text-[#07100d] font-black shadow-md shadow-[#a4ff78]/30 scale-[1.02]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Open ${item.label}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#07100d]' : 'text-zinc-400'
                    }`}
                  />
                  <span className="text-xs tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="w-[1px] h-5 bg-white/10 shrink-0 mx-1" />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAnalyzeFoodModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#a4ff78]/40 text-xs font-bold transition active:scale-95 shrink-0 font-manrope"
              title="Scan or upload food photo to analyze nutrition"
            >
              <Camera className="w-3.5 h-3.5 text-[#a4ff78]" />
              <span className="text-xs">Scan Food</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCheckInModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#a4ff78] hover:bg-[#8def5c] text-[#07100d] text-xs font-black transition active:scale-95 shadow-md shadow-[#a4ff78]/30 shrink-0 font-manrope"
              title="Log today's weight, meals, water, and workout"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#07100d]" />
              <span className="text-xs">Check-in</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
