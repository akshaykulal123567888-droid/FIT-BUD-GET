import React, { useState } from 'react';
import {
  Dumbbell,
  Bell,
  HelpCircle,
  User,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
  Wallet,
  UtensilsCrossed,
  Camera,
  Presentation,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadNotifsCount,
    markNotifsRead,
    notifications,
    setIsAnalyzeFoodModalOpen,
    setIsSlidesModalOpen,
  } = useApp();

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNavClick = (tab: 'home' | 'diet' | 'workout') => {
    setIsMobileMenuOpen(false);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 pt-4 sm:pt-6 px-4">
      <nav className="max-w-5xl mx-auto flex items-center justify-between bg-black/75 backdrop-blur-xl border border-white/10 rounded-full px-5 sm:px-6 py-2.5 sm:py-3 shadow-2xl">
        {/* Brand with Emerald Diamond Accent */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          onClick={() => handleNavClick('home')}
        >
          <div className="w-5 h-5 bg-[#a4ff78] rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_12px_rgba(164,255,120,0.6)] group-hover:rotate-90 transition-transform duration-300">
            <span className="w-1.5 h-1.5 bg-[#07100d] rounded-full -rotate-45" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
            fit<span className="font-playfair italic font-normal text-[#8bea3b]">budget</span>
          </span>
        </div>

        {/* Right Actions: Notifications & My Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifDropdownOpen(!isNotifDropdownOpen);
                if (!isNotifDropdownOpen) markNotifsRead();
              }}
              className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition"
              title="Reminders & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#a4ff78] animate-pulse ring-2 ring-black" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotifDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <span className="font-bold font-manrope text-white text-sm">Fitness Reminders</span>
                  <span className="text-[10px] text-zinc-500">{notifications.length} alerts</span>
                </div>
                <div className="py-2 divide-y divide-zinc-900 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-4 text-center text-zinc-500">No new alerts. Keep crushing goals!</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="py-2.5 space-y-0.5">
                        <div className="font-semibold text-white flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-zinc-500">{n.timestamp}</span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-tight">{n.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>


          {/* Single Interactive 'My Profile' Button */}
          <button
            onClick={() => {
              setActiveTab('settings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-4 sm:px-5 py-2 transition-all active:scale-95 border ${
              activeTab === 'settings'
                ? 'bg-[#a4ff78] text-[#07100d] border-[#a4ff78] shadow-lg shadow-[#a4ff78]/35 font-black'
                : 'bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border-white/10 hover:border-[#a4ff78]/40 font-bold'
            }`}
            title="My Profile & Settings"
          >
            <span className="relative z-10 flex items-center gap-2 text-xs sm:text-sm font-manrope">
              <User className={`w-3.5 h-3.5 ${activeTab === 'settings' ? 'text-[#07100d]' : 'text-[#a4ff78]'} group-hover:scale-110 transition-transform`} />
              <span>My Profile</span>
            </span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/5 border border-white/10 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-[#a4ff78]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="max-w-5xl mx-auto mt-2 bg-black/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl animate-fade-up">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-zinc-800">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-zinc-900 text-white"
            >
              <Dumbbell className="w-4 h-4 text-[#a4ff78]" />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleNavClick('diet')}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-zinc-900 text-white"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#a4ff78]" />
              <span>Diet Plan</span>
            </button>
            <button
              onClick={() => handleNavClick('workout')}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-zinc-900 text-white"
            >
              <Flame className="w-4 h-4 text-[#a4ff78]" />
              <span>Workouts</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAnalyzeFoodModalOpen(true);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold bg-zinc-900 text-[#a4ff78]"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Food</span>
            </button>
          </div>

          <div className="pt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSlidesModalOpen(true);
              }}
              className="text-left text-xs font-medium text-[#a4ff78] hover:text-white py-1 flex items-center gap-1.5"
            >
              <Presentation className="w-3.5 h-3.5 text-[#a4ff78]" />
              <span>Presentation Slides Deck</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                scrollToSection('features');
              }}
              className="text-left text-xs font-medium text-zinc-400 hover:text-white py-1"
            >
              Explore Features
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setActiveTab('settings');
              }}
              className="text-left text-xs font-medium text-zinc-400 hover:text-[#a4ff78] py-1 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>My Profile & Preferences</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
