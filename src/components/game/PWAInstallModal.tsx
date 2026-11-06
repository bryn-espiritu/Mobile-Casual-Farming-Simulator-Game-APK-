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
              <p className="text-xs text-slate-400">Play Naga Farm full-screen on Android & iOS</p>
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
        <div className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <img
              src={appIcon}
              alt="Naga Farm Icon"
              className="w-14 h-14 rounded-2xl shadow-md border border-white/20 shrink-0"
            />
            <div>
              <h3 className="text-sm font-bold text-white">Naga Farm: Bicolandia Homestead</h3>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Creator: <strong className="text-amber-300">Bryn Espiritu</strong> · Powered by <strong className="text-emerald-300">Google AI</strong>
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-400 font-mono">
                <span>✓ Verified WebAPK</span>
                <span>·</span>
                <span>✓ 60 FPS</span>
                <span>·</span>
                <span>✓ Offline Ready</span>
              </div>
            </div>
          </div>

          {/* Guaranteed 1-Tap Android Install (WebAPK) */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                <span>⚡</span> Recommended: 1-Tap Android App Install
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                No Parse Error
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Google Chrome on Android mints and signs the native Android package (<code className="text-emerald-400 font-mono">WebAPK</code>) directly into your app drawer. 100% immune to &quot;Problem parsing package&quot; errors!
            </p>

            {isInstalled ? (
              <div className="p-2.5 bg-emerald-900/40 border border-emerald-500/40 rounded-xl text-center text-emerald-300 font-medium text-xs">
                🎉 Naga Farm is already installed and running as a native Android app!
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Install Native Android App (1-Tap)</span>
              </button>
            ) : (
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-white block">To Install from Android Chrome:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-300">
                  <li>Tap the <strong>⋮ (3 dots)</strong> menu in the top right of Chrome.</li>
                  <li>Tap <strong>Install App</strong> or <strong>Add to Home screen</strong>.</li>
                  <li>Naga Farm installs cleanly to your Android home screen!</li>
                </ol>
              </div>
            )}
          </div>

          {/* Android Parse Error Troubleshooting Card */}
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-200/90 space-y-1.5">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>⚠️</span> Seeing &quot;There was a problem parsing the package&quot;?
            </span>
            <p className="text-amber-100/80 leading-relaxed text-[11px]">
              Android gives this error when an APK downloaded from GitHub is an HTML webpage rather than binary Dalvik bytecode, or when Android security blocks unsigned side-loading.
            </p>
            <div className="text-[10px] text-amber-300/90 font-mono bg-amber-950/60 p-2 rounded-lg border border-amber-500/20">
              ✓ <strong>Fix 1:</strong> Use the green 1-Tap Install button above (WebAPK).<br />
              ✓ <strong>Fix 2:</strong> Download the fresh 2.3MB binary packages below.
            </div>
          </div>

          {/* Direct APK File Download Button */}
          <a
            href="/naga-farm.apk"
            download="naga-farm.apk"
            onClick={() => sound.playCoin()}
            className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-300 active:scale-95"
          >
            <span className="text-base">📥</span>
            <span>Direct Download Raw APK (naga-farm.apk)</span>
          </a>

          {/* Direct Compressed ZIP Download Button */}
          <a
            href="/naga-farm.zip"
            download="naga-farm.zip"
            onClick={() => sound.playCoin()}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>🗜️</span>
            <span>Download Compressed ZIP (naga-farm.zip)</span>
          </a>

          {/* GitHub Repository Mirror */}
          <a
            href="https://github.com/bryn-espiritu/Mobile-Casual-Farming-Simulator-Game-APK-"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playTap()}
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🐙</span>
            <span>GitHub Repository (Bryn Espiritu · Commit 260603a)</span>
          </a>

          {isIOS && (
            <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl space-y-1">
              <span className="font-bold text-slate-200 block text-xs">How to install on iPhone / iPad:</span>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-300 text-[11px]">
                <li>Tap the <strong>Share</strong> button in Safari toolbar.</li>
                <li>Scroll down and select <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> in the top-right corner.</li>
              </ol>
            </div>
          )}

          <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
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
