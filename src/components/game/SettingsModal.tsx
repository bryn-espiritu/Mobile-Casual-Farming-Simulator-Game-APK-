import React, { useState } from 'react';
import { GameState } from '../../types/game';
import { sound } from '../../services/audio';

interface SettingsModalProps {
  gameState: GameState;
  onClose: () => void;
  onReturnToTitle: () => void;
  onToggleSFX: () => void;
  onToggleAmbient: () => void;
  onToggleMobileFrame: () => void;
  onUpdateFarmName: (name: string) => void;
  onResetFarm: () => void;
  onOpenInstallModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  gameState,
  onClose,
  onReturnToTitle,
  onToggleSFX,
  onToggleAmbient,
  onToggleMobileFrame,
  onUpdateFarmName,
  onResetFarm,
  onOpenInstallModal,
}) => {
  const [editingName, setEditingName] = useState(gameState.farmName);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">Settings & Homestead</h2>
              <p className="text-xs text-slate-400">Controls, Audio & Game Preferences</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Farm Name Setting */}
          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Farmstead Name</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingName}
                maxLength={26}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={() => {
                  sound.playTap();
                  onUpdateFarmName(editingName.trim() || 'Meadowbrook Farm');
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>

          {/* Audio Toggles */}
          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">Sound & Music</span>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <span className="text-xs text-slate-200">Sound Effects (SFX)</span>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  onToggleSFX();
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  !gameState.sfxMuted ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                    !gameState.sfxMuted ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎶</span>
                <span className="text-xs text-slate-200">Acoustic Ambient Music</span>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  onToggleAmbient();
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  !gameState.ambientMuted ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                    !gameState.ambientMuted ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Viewport & APK Settings */}
          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">Display & APK Simulation</span>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-200 block">Mobile APK Frame Mode</span>
                <span className="text-[10px] text-slate-400 block">Preview mobile smartphone frame on desktop</span>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  onToggleMobileFrame();
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  gameState.mobileFrameMode ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                    gameState.mobileFrameMode ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => {
                sound.playTap();
                onOpenInstallModal();
              }}
              className="w-full py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Mobile APK / PWA Install Guide
            </button>
          </div>

          {/* Actions: Return to Title & Reset */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                sound.playTap();
                onReturnToTitle();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Return to Title Screen
            </button>

            {showConfirmReset ? (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-center space-y-2">
                <p className="text-xs text-rose-200">Start new farm? Your current progress will be reset.</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      sound.playTap();
                      onResetFarm();
                      setShowConfirmReset(false);
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2 text-rose-400 hover:text-rose-300 text-xs font-medium cursor-pointer"
              >
                Reset & Start New Farm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
