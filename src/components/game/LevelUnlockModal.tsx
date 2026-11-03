import React from 'react';
import { LevelUnlockInfo } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface LevelUnlockModalProps {
  levelInfo: LevelUnlockInfo;
  currentLevel: number;
  onClose: () => void;
  onOpenFeature?: (feature: 'kusina' | 'autotech' | 'homestead' | 'shop') => void;
}

export const LevelUnlockModal: React.FC<LevelUnlockModalProps> = ({
  levelInfo,
  currentLevel,
  onClose,
  onOpenFeature,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Banner Header with celebratory glow */}
        <div className="relative p-6 bg-gradient-to-b from-amber-600/30 via-amber-950/40 to-transparent border-b border-amber-500/20 text-center flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-4xl font-extrabold text-slate-950 shadow-xl border-4 border-amber-200 shadow-amber-500/30">
              {currentLevel}
            </div>
            <span className="absolute -bottom-2 -right-2 text-2xl animate-bounce">🎉</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider mb-1">
            {levelInfo.badge || 'Level Milestone'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white drop-shadow-md">
            {levelInfo.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-sm">
            Congratulations! Your agricultural expertise has unlocked new fields, features, and livestock!
          </p>
        </div>

        {/* Perks & How-To-Use Instructions List */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh] space-y-3">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Newly Unlocked & Instructions:
          </div>

          {levelInfo.perks.map((perk, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-md flex items-start gap-3.5 hover:border-amber-500/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {perk.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{perk.name}</span>
                </h4>
                <div className="mt-1 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
                    How to Use It:
                  </span>
                  {perk.instruction}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Action */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Total fields allowed: <span className="font-mono font-bold text-emerald-400">{currentLevel * 3}</span>
          </span>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-xl border border-amber-300 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>🌾</span>
            <span>Let's Farm!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
