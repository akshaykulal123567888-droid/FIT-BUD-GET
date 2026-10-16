import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronDown, Sparkles, Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../assets/images';
import { RevealLayer } from './RevealLayer';

export const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85';

export const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85';

export const SpotlightHero: React.FC = () => {
  const { setIsOnboardingOpen } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const SPOTLIGHT_R = 200;

  // Visual mode: 'fitness' (FitBudget athletic & nutrition) or 'geological' (Sediment archive)
  const [themeMode, setThemeMode] = useState<'fitness' | 'geological'>('fitness');

  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smooth = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasInteractedRef = useRef<boolean>(false);

  useEffect(() => {
    // Center spotlight initially
    const initX = typeof window !== 'undefined' ? window.innerWidth / 2 : 600;
    const initY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

    mouse.current = { x: initX, y: initY };
    smooth.current = { x: initX, y: initY };
    setCoords({ x: Math.round(initX), y: Math.round(initY) });

    let angle = 0;

    const animate = () => {
      // If user hasn't moved cursor yet, gently drift spotlight around center to entice interaction
      if (!hasInteractedRef.current && containerRef.current) {
        angle += 0.015;
        const rect = containerRef.current.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        mouse.current = {
          x: cx + Math.cos(angle) * 75,
          y: cy + Math.sin(angle * 1.3) * 45,
        };
      }

      // Smooth interpolation (lerp factor 0.15)
      const dx = mouse.current.x - smooth.current.x;
      const dy = mouse.current.y - smooth.current.y;
      smooth.current.x += dx * 0.15;
      smooth.current.y += dy * 0.15;

      setCoords({
        x: Math.round(smooth.current.x),
        y: Math.round(smooth.current.y),
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    hasInteractedRef.current = true;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouse.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    hasInteractedRef.current = true;
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouse.current = {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  }, []);

  const scrollToExplore = () => {
    const el = document.getElementById('explore-dashboard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
    }
  };

  const currentBaseImage = themeMode === 'fitness' ? ASSETS.workoutAthleteNoir : BG_IMAGE_1;
  const currentRevealImage = themeMode === 'fitness' ? ASSETS.dietPlateNoir : BG_IMAGE_2;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchMove}
      className="relative w-full overflow-hidden h-screen bg-black select-none cursor-crosshair"
      style={{ height: '100dvh' }}
    >
      {/* 1. Base image (z-10): absolute inset-0 bg-center bg-cover bg-no-repeat */}
      <div
        className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat transition-[background-image] duration-500"
        style={{
          backgroundImage: `url(${currentBaseImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 pointer-events-none" />
      </div>

      {/* 2. Reveal layer (z-30): a RevealLayer component showing reveal image through circular mask */}
      <RevealLayer
        x={coords.x}
        y={coords.y}
        r={SPOTLIGHT_R}
        imageSrc={currentRevealImage}
      />

      {/* 3. Heading (z-50): absolute top-[18%] sm:top-[16%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none */}
      <div className="absolute top-[18%] sm:top-[16%] left-0 right-0 flex flex-col items-center text-center px-4 sm:px-6 pointer-events-none z-50">
        <h1
          className="text-white leading-[0.95] max-w-5xl mx-auto"
          aria-label="Smart Fitness. Smarter Budget . Built a better you"
        >
          <span
            className="block font-playfair italic font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-[0_8px_32px_rgba(0,0,0,0.85)]"
            style={{ letterSpacing: '-0.05em' }}
          >
            Smart Fitness. Smarter Budget .
          </span>
          <span
            className="block font-normal text-4xl sm:text-6xl md:text-7xl lg:text-8xl mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-[#c5ffd8] to-[#8bea3b] drop-shadow-[0_8px_32px_rgba(0,0,0,0.85)]"
            style={{ letterSpacing: '-0.06em' }}
          >
            Built a better you
          </span>
        </h1>
      </div>

      {/* 4. Bottom-left paragraph (z-50): hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[280px] */}
      <div className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[280px] z-50">
        <p className="text-sm text-white/80 leading-relaxed drop-shadow-md">
          Build healthier habits with smarter food choices, personalized workouts, nutrition tracking, and a budget that works for you.
        </p>

        {/* Visual theme toggle discreetly placed in bottom-left */}
        <div className="mt-3 flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 w-fit pointer-events-auto">
          <button
            onClick={() => setThemeMode('fitness')}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
              themeMode === 'fitness'
                ? 'bg-[#8bea3b] text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-2.5 h-2.5" />
            <span>Fitness</span>
          </button>
          <button
            onClick={() => setThemeMode('geological')}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
              themeMode === 'geological'
                ? 'bg-white/20 text-white font-medium shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5 text-[#8bea3b]" />
            <span>Sediment</span>
          </button>
        </div>
      </div>

      {/* 5. Bottom-right block (z-50) */}
      <div className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 z-50">
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed drop-shadow-md">
          Plan your meals, track your nutrition, manage your food budget, and stay consistent with your fitness goals — all in one place.
        </p>

        <div className="flex flex-wrap items-center gap-3 w-full pointer-events-auto">
          <button
            onClick={scrollToExplore}
            className="bg-[#8bea3b] hover:bg-[#78d52f] text-black text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg cursor-pointer"
          >
            Explore Now
          </button>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-3 rounded-full transition-all border border-white/15 cursor-pointer backdrop-blur-md active:scale-95"
          >
            Start My Plan
          </button>
        </div>
      </div>

      {/* Subtle bottom center scroll hint */}
      <button
        onClick={scrollToExplore}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors text-xs font-mono pointer-events-auto z-50 cursor-pointer"
        aria-label="Scroll down to explore dashboard"
      >
        <span className="hidden sm:inline text-[11px] tracking-wider uppercase">Scroll to explore</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-[#8bea3b]" />
      </button>
    </section>
  );
};
