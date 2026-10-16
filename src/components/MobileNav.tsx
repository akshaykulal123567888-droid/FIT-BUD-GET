import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  Clock,
  LineChart,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const items = [
    { key: 'home', label: 'Home', icon: LayoutDashboard },
    { key: 'diet', label: 'Diet', icon: UtensilsCrossed },
    { key: 'workout', label: 'Workout', icon: Dumbbell },
    { key: 'routine', label: 'Routine', icon: Clock },
    { key: 'progress', label: 'Progress', icon: LineChart },
    { key: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d1e]/95 backdrop-blur-xl border-t border-[#16254c] px-2 py-1.5 shadow-[0_-4px_25px_rgba(2,6,23,0.8)]">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? 'text-blue-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition ${
                  isActive ? 'bg-blue-500/15 text-blue-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
