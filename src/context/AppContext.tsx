import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, UserPlan, DailyLog, NotificationSettings } from '../../server/db';
import { INITIAL_FOOD_DATABASE, FoodItem } from '../data/foodDatabase';
import { calculatePersonalizedPlan } from '../utils/calculations';
import { generatePersonalizedDiet } from '../utils/dietGenerator';
import { generatePersonalizedWorkout } from '../utils/workoutGenerator';
import { generateDailyRoutine } from '../utils/routineGenerator';
import { checkScheduledReminders, sendNotification, InAppNotification } from '../utils/notifications';

interface AppContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeTab: 'home' | 'diet' | 'workout' | 'routine' | 'progress' | 'foods' | 'settings';
  setActiveTab: (tab: 'home' | 'diet' | 'workout' | 'routine' | 'progress' | 'foods' | 'settings') => void;
  // Auth & demo
  loginWithEmail: (email: string) => Promise<void>;
  registerUser: (name: string, email: string) => Promise<void>;
  loadDemoUser: () => Promise<void>;
  logout: () => void;
  // Profile & Plan
  updateProfile: (profile: UserProfile) => Promise<void>;
  updateAccount: (name: string, email?: string) => Promise<void>;
  updatePlan: (plan: Partial<UserPlan>) => Promise<void>;
  regenerateAllPlans: (profile: UserProfile, userName?: string, userEmail?: string) => Promise<void>;
  startNewProfileCreation: () => void;
  // Daily Logs & Check-in
  todayLog: DailyLog;
  saveTodayLog: (logUpdate: Partial<DailyLog>) => Promise<void>;
  refreshLogs: () => Promise<void>;
  // Custom Food Prices
  updateFoodPrice: (foodId: string, price: number) => Promise<void>;
  // Notifications
  notifications: InAppNotification[];
  unreadNotifsCount: number;
  markNotifsRead: () => void;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  triggerTestNotification: (title: string, body: string) => void;
  // UI Modals
  isCheckInModalOpen: boolean;
  setIsCheckInModalOpen: (open: boolean) => void;
  isDisclaimerModalOpen: boolean;
  setIsDisclaimerModalOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isAnalyzeFoodModalOpen: boolean;
  setIsAnalyzeFoodModalOpen: (open: boolean) => void;
  isSlidesModalOpen: boolean;
  setIsSlidesModalOpen: (open: boolean) => void;
  currency: string;
  initialBudget: { amount: number; frequency: 'daily' | 'weekly' | 'monthly' };
  setInitialBudget: (budget: { amount: number; frequency: 'daily' | 'weekly' | 'monthly' }) => void;
  startNewPlanWithBudget: (amount: number, frequency: 'daily' | 'weekly' | 'monthly') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TOKEN_KEY = 'fitbudget_token';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'home' | 'diet' | 'workout' | 'routine' | 'progress' | 'foods' | 'settings'>('home');
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [alreadyTriggeredReminders] = useState<Set<string>>(new Set());

  // Modals
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAnalyzeFoodModalOpen, setIsAnalyzeFoodModalOpen] = useState(false);
  const [isSlidesModalOpen, setIsSlidesModalOpen] = useState(false);
  const [initialBudget, setInitialBudget] = useState<{ amount: number; frequency: 'daily' | 'weekly' | 'monthly' }>({
    amount: 150,
    frequency: 'daily',
  });

  const startNewPlanWithBudget = (amount: number, frequency: 'daily' | 'weekly' | 'monthly') => {
    setInitialBudget({ amount, frequency });
    setIsOnboardingOpen(true);
  };

  const currency = user?.profile?.currency || '₹';

  // Load current user profile from server
  const loadUserData = async (activeId?: string) => {
    const id = activeId || token;
    if (!id) {
      await loadDemoUser();
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { 'x-user-id': id },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        await loadDemoUser();
      }
    } catch (err) {
      console.warn('Failed to load user from backend:', err);
      await loadDemoUser();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Periodic notification checker (every 30 seconds)
  useEffect(() => {
    if (!user?.notificationSettings) return;

    const interval = setInterval(() => {
      checkScheduledReminders(
        user.notificationSettings,
        alreadyTriggeredReminders,
        (newNotif) => {
          setNotifications((prev) => [newNotif, ...prev]);
        }
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.notificationSettings]);

  const loginWithEmail = async (email: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setIsOnboardingOpen(!data.user.profile);
    }
  };

  const registerUser = async (name: string, email: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setIsOnboardingOpen(true);
    }
  };

  const loadDemoUser = async () => {
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to load demo user:', e);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const updateAccount = async (name: string, email?: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/user/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to update account info:', err);
    }
  };

  const startNewProfileCreation = () => {
    setIsOnboardingOpen(true);
  };

  const updateProfile = async (profile: UserProfile, targetUserId?: string) => {
    const id = targetUserId || user?.id;
    if (!id) return;
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': id,
      },
      body: JSON.stringify({ profile }),
    });
    if (res.ok) {
      setUser((prev) => (prev ? { ...prev, profile } : prev));
    }
  };

  const updatePlan = async (planUpdate: Partial<UserPlan>, targetUserId?: string) => {
    const id = targetUserId || user?.id;
    if (!id) return;
    const mergedPlan: UserPlan = {
      ...(user?.plan || { meals: [], workoutSplit: [], dailyRoutine: [] }),
      ...planUpdate,
      updatedAt: new Date().toISOString(),
    };
    const res = await fetch('/api/user/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': id,
      },
      body: JSON.stringify(mergedPlan),
    });
    if (res.ok) {
      setUser((prev) => (prev ? { ...prev, plan: mergedPlan } : prev));
    }
  };

  const regenerateAllPlans = async (profile: UserProfile, userName?: string, userEmail?: string) => {
    let activeUser = user;
    let activeId = activeUser?.id;

    // If user has no account yet or is creating a fresh profile, register them!
    if (!activeUser || !activeId) {
      const chosenName = userName?.trim() || 'My Profile';
      const chosenEmail = userEmail?.trim() || `athlete_${Date.now()}@fitbudget.app`;
      try {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: chosenName, email: chosenEmail }),
        });
        if (regRes.ok) {
          const regData = await regRes.json();
          localStorage.setItem(TOKEN_KEY, regData.token);
          setToken(regData.token);
          activeUser = regData.user;
          activeId = regData.token;
          setUser(regData.user);
        } else {
          // If exists, login with email
          const logRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: chosenEmail }),
          });
          if (logRes.ok) {
            const logData = await logRes.json();
            localStorage.setItem(TOKEN_KEY, logData.token);
            setToken(logData.token);
            activeUser = logData.user;
            activeId = logData.token;
            setUser(logData.user);
          }
        }
      } catch (err) {
        console.error('Error during profile registration:', err);
      }
    } else if (userName && userName.trim() && activeUser.name !== userName.trim()) {
      // Update account name if user changed it in onboarding
      await updateAccount(userName.trim(), userEmail?.trim());
    }

    if (!activeId) return;

    const calc = calculatePersonalizedPlan({
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      budgetFrequency: profile.budgetFrequency,
      budgetAmount: profile.budgetAmount,
    });

    const enrichedProfile: UserProfile = {
      ...profile,
      calculatedMetrics: {
        bmi: calc.bmi,
        bmiCategory: calc.bmiCategory,
        bmr: calc.bmr,
        tdee: calc.tdee,
        targetCalories: calc.targetCalories,
        targetProteinGrams: calc.targetProteinGrams,
        targetCarbsGrams: calc.targetCarbsGrams,
        targetFatGrams: calc.targetFatGrams,
        targetDailyBudget: calc.dailyBudget,
      },
    };

    const newMeals = generatePersonalizedDiet({
      targetCalories: calc.targetCalories,
      targetProtein: calc.targetProteinGrams,
      foodPreference: profile.foodPreference,
      allergies: profile.allergies,
      dailyBudget: calc.dailyBudget,
      customPrices: activeUser?.customPrices,
    });

    const newWorkoutSplit = generatePersonalizedWorkout({
      goal: profile.goal,
      experience: profile.experience,
      equipment: profile.equipment,
      workoutDaysPerWeek: profile.workoutDaysPerWeek,
      availableMinutes: profile.workoutDurationMinutes,
    });

    const newDailyRoutine = generateDailyRoutine({
      wakeTime: profile.wakeTime,
      sleepTime: profile.sleepTime,
      workStartTime: profile.workStartTime,
      workEndTime: profile.workEndTime,
      preferredWorkoutTime: profile.preferredWorkoutTime,
      workoutDurationMinutes: profile.workoutDurationMinutes,
    });

    const newPlan: UserPlan = {
      meals: newMeals,
      workoutSplit: newWorkoutSplit,
      dailyRoutine: newDailyRoutine,
      updatedAt: new Date().toISOString(),
    };

    // Save profile and plan to backend
    await updateProfile(enrichedProfile, activeId);
    await updatePlan(newPlan, activeId);

    // Refresh state
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        profile: enrichedProfile,
        plan: newPlan,
      };
    });
    if (!user?.profile) {
      setActiveTab('home');
    }
  };

  // Helper for today's date 'YYYY-MM-DD'
  const todayStr = new Date().toISOString().split('T')[0];

  const todayLog: DailyLog = user?.logs?.find((l) => l.date === todayStr) || {
    date: todayStr,
    weightKg: user?.profile?.weightKg || 65,
    energyLevel: 4,
    mealsCompleted: [],
    workoutCompleted: false,
    waterIntakeMl: 0,
    sleepHours: 7.5,
    caloriesConsumed: 0,
    proteinConsumed: 0,
    foodSpent: 0,
    notes: '',
  };

  const saveTodayLog = async (logUpdate: Partial<DailyLog>) => {
    if (!user) return;
    const merged: DailyLog = {
      ...todayLog,
      ...logUpdate,
      date: todayStr,
    };

    const res = await fetch('/api/user/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
      },
      body: JSON.stringify({ log: merged }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser((prev) => (prev ? { ...prev, logs: data.logs } : prev));
    }
  };

  const refreshLogs = async () => {
    if (!user) return;
    const res = await fetch('/api/user/logs', {
      headers: { 'x-user-id': user.id },
    });
    if (res.ok) {
      const data = await res.json();
      setUser((prev) => (prev ? { ...prev, logs: data.logs } : prev));
    }
  };

  const updateFoodPrice = async (foodId: string, price: number) => {
    if (!user) return;
    const res = await fetch('/api/user/custom-prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
      },
      body: JSON.stringify({ foodId, price }),
    });
    if (res.ok) {
      const data = await res.json();
      const updatedCustomPrices = data.customPrices;

      // Synchronize with existing meal plan if the food is present
      if (user.plan?.meals) {
        let hasFood = false;
        const updatedMeals = user.plan.meals.map((meal) => {
          let mealChanged = false;
          const updatedItems = meal.items.map((item) => {
            if (item.foodId === foodId) {
              mealChanged = true;
              hasFood = true;
              return {
                ...item,
                cost: Math.round(price * item.quantity),
              };
            }
            return item;
          });

          if (!mealChanged) return meal;
          return {
            ...meal,
            items: updatedItems,
            totalCost: updatedItems.reduce((acc, i) => acc + i.cost, 0),
          };
        });

        if (hasFood) {
          const updatedPlan: UserPlan = {
            ...user.plan,
            meals: updatedMeals,
            updatedAt: new Date().toISOString(),
          };
          await fetch('/api/user/plan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user.id,
            },
            body: JSON.stringify(updatedPlan),
          });
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  customPrices: updatedCustomPrices,
                  plan: updatedPlan,
                }
              : prev
          );
          return;
        }
      }

      setUser((prev) => (prev ? { ...prev, customPrices: updatedCustomPrices } : prev));
    }
  };

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    if (!user) return;
    const res = await fetch('/api/user/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
      },
      body: JSON.stringify({ settings }),
    });
    if (res.ok) {
      setUser((prev) => (prev ? { ...prev, notificationSettings: settings } : prev));
    }
  };

  const triggerTestNotification = (title: string, body: string) => {
    const notif = sendNotification(title, body, '🔔');
    setNotifications((prev) => [notif, ...prev]);
  };

  const markNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isLoading,
        activeTab,
        setActiveTab,
        loginWithEmail,
        registerUser,
        loadDemoUser,
        logout,
        updateProfile,
        updatePlan,
        regenerateAllPlans,
        todayLog,
        saveTodayLog,
        refreshLogs,
        updateFoodPrice,
        notifications,
        unreadNotifsCount,
        markNotifsRead,
        updateNotificationSettings,
        triggerTestNotification,
        isCheckInModalOpen,
        setIsCheckInModalOpen,
        isDisclaimerModalOpen,
        setIsDisclaimerModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isAnalyzeFoodModalOpen,
        setIsAnalyzeFoodModalOpen,
        isSlidesModalOpen,
        setIsSlidesModalOpen,
        currency,
        initialBudget,
        setInitialBudget,
        startNewPlanWithBudget,
        updateAccount,
        startNewProfileCreation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
