import React, { useEffect } from 'react';
import { GameState } from '../../types/game';
import { sound } from '../../services/audio';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import scenicBackdrop from '../../assets/images/farm_scenic_backdrop_1793616391852.jpg';
import appIcon from '../../assets/images/farm_app_icon_1793616391133.jpg';

interface TitleScreenProps {
  gameState: GameState;
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenInstallModal: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  gameState,
  onStartGame,
  onOpenSettings,
  onOpenInstallModal,
}) => {
  const { isInstallable, install } = usePWAInstall();

  // Keyboard shortcut: Space or Enter to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.ensureUnlocked();
        sound.playTap();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden select-none bg-[#111913] text-slate-100">
      {/* Scenic live-world atmosphere background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={scenicBackdrop}
          alt="Scenic farm at sunrise"
          className="w-full h-full object-cover object-center scale-105 animate-pulse-gentle transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Soft radial scrim to ensure 30-40% breathing space and pristine title contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/80" />
      </div>

      {/* Top Bar Status / Mute / Mobile APK button */}
      <div className="relative z-10 w-full max-w-5xl px-6 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={appIcon}
            alt="Meadowbrook Icon"
            className="w-9 h-9 rounded-xl shadow-md border border-white/20"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest">Cozy Farm Sim</span>
            <span className="text-[11px] text-slate-300">Touch & Mobile Optimized</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInstallable && (
            <button
              onClick={install}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Install Mobile APK
            </button>
          )}

          <button
            onClick={onOpenInstallModal}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-black/40 hover:bg-black/60 rounded-lg border border-white/10 transition-colors"
          >
            APK Info
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-200 hover:text-white bg-black/40 hover:bg-black/60 rounded-lg border border-white/10 transition-colors"
            title="Game Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece & Bespoke Inline SVG Title Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-xl">
        <div className="w-full flex justify-center mb-4">
          <svg viewBox="0 0 460 120" className="w-full max-w-[380px] drop-shadow-2xl">
            <defs>
              <linearGradient id="titleGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Decorative Wheat & Vine Arches */}
            <path d="M 60 70 Q 140 25 230 25 Q 320 25 400 70" fill="none" stroke="url(#leafGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            <circle cx="60" cy="70" r="4" fill="#facc15" />
            <circle cx="400" cy="70" r="4" fill="#facc15" />

            {/* Main Wordmark Typography */}
            <text
              x="230"
              y="68"
              textAnchor="middle"
              fill="url(#titleGold)"
              fontSize="44"
              fontWeight="800"
              fontFamily="'Outfit', sans-serif"
              letterSpacing="1.5"
              filter="url(#glow)"
            >
              MEADOWBROOK
            </text>

            <text
              x="230"
              y="98"
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="16"
              fontWeight="600"
              fontFamily="'Plus Jakarta Sans', sans-serif"
              letterSpacing="7"
              opacity="0.95"
            >
              FARMSTEAD
            </text>
          </svg>
        </div>

        <p className="text-sm sm:text-base text-emerald-100/90 font-medium max-w-md mx-auto leading-relaxed mb-6">
          Cultivate your countryside haven. Sow seasonal crops, tend fluffy animals, fulfill village orders, and unwind at your own pace.
        </p>

        {/* Primary Start CTA Button */}
        <button
          onClick={() => {
            sound.ensureUnlocked();
            sound.playTap();
            onStartGame();
          }}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-base sm:text-lg font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-2xl shadow-xl shadow-amber-950/40 transform hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>{gameState.totalDays > 1 ? 'Continue Farming' : 'Start Farming'}</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </button>

        {/* Single flat control hint line */}
        <div className="mt-4 text-xs text-slate-300 font-mono tracking-wide">
          Drag to Pan · Pinch / Scroll to Zoom · Tap to Tend
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="relative z-10 w-full max-w-3xl px-6 pb-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-semibold">{gameState.farmName}</span>
          <span>·</span>
          <span>Level {gameState.level}</span>
          <span>·</span>
          <span className="capitalize">{gameState.season} Day {gameState.seasonDay}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>Full Offline Support</span>
          <span>·</span>
          <span>Touch & Mouse Friendly</span>
          <span>·</span>
          <span>Auto-Saved</span>
        </div>
      </div>
    </div>
  );
};
