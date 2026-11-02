import React from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { sound } from '../../services/audio';
import appIcon from '../../assets/images/farm_app_icon_1793616391133.jpg';

interface PWAInstallModalProps {
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstallClick = async () => {
    sound.playTap();
    await install();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">📱</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">Mobile APK & App Install</h2>
              <p className="text-xs text-slate-400">Play Meadowbrook full-screen on mobile</p>
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
        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <img
              src={appIcon}
              alt="Meadowbrook Farm Icon"
              className="w-14 h-14 rounded-2xl shadow-md border border-white/20 shrink-0"
            />
            <div>
              <h3 className="text-sm font-bold text-white">Meadowbrook Farm</h3>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Version 1.0 · Standalone Offline Farm Sim
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-400">
                <span>✓ Touch Gestures</span>
                <span>·</span>
                <span>✓ 60 FPS</span>
                <span>·</span>
                <span>✓ Auto-Save</span>
              </div>
            </div>
          </div>

          {/* Install Status */}
          {isInstalled ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center text-emerald-300 font-medium">
              🎉 Meadowbrook is already installed and running in standalone mode!
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Install to Home Screen Now
            </button>
          ) : isIOS ? (
            <div className="p-3.5 bg-slate-800/70 border border-slate-700 rounded-xl space-y-2">
              <span className="font-bold text-slate-200 block text-xs">How to install on iPhone / iPad:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                <li>Tap the <strong>Share</strong> button in Safari toolbar.</li>
                <li>Scroll down and select <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> in the top-right corner.</li>
              </ol>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-800/70 border border-slate-700 rounded-xl space-y-2">
              <span className="font-bold text-slate-200 block text-xs">How to install on Android / Chrome:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                <li>Tap the <strong>⋮ (Menu)</strong> in your browser.</li>
                <li>Select <strong>Install App</strong> or <strong>Add to Home screen</strong>.</li>
                <li>Launch Meadowbrook anytime directly from your Android app drawer!</li>
              </ol>
            </div>
          )}

          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Mobile Features:</span>
            <p>• Intuitive one-finger pan & two-finger pinch zoom</p>
            <p>• Swipe harvesting across ripe plots</p>
            <p>• Haptic/audio feedback for petting and planting</p>
            <p>• Zero battery-draining ads or online waiting walls</p>
          </div>
        </div>
      </div>
    </div>
  );
};
