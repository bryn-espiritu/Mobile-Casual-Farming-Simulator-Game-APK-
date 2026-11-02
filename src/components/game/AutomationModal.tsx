import React from 'react';
import { AutomationState, GameState } from '../../types/game';
import { AUTOMATION_TIERS } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface AutomationModalProps {
  gameState: GameState;
  onClose: () => void;
  onToggleAutomation: (key: keyof AutomationState) => void;
  onUpgradeAutomation: (type: 'autoHarvest' | 'autoPlant' | 'autoFeed' | 'autoWater', targetLevel: number, costCoins: number, costGems: number) => void;
}

export const AutomationModal: React.FC<AutomationModalProps> = ({
  gameState,
  onClose,
  onToggleAutomation,
  onUpgradeAutomation,
}) => {
  const automation = gameState.automation || {
    autoHarvestEnabled: false,
    autoHarvestLevel: 0,
    autoPlantEnabled: false,
    autoPlantLevel: 0,
    autoFeedEnabled: false,
    autoFeedLevel: 0,
    autoWaterEnabled: false,
    autoWaterLevel: 0,
  };

  const modules = [
    {
      type: 'autoHarvest' as const,
      name: 'Auto-Harvest (Scythe Drone)',
      icon: '🌾',
      level: automation.autoHarvestLevel,
      enabled: automation.autoHarvestEnabled,
      toggleKey: 'autoHarvestEnabled' as keyof AutomationState,
      tiers: AUTOMATION_TIERS.autoHarvest,
      summary: 'Gathers ripe crops into your granary automatically.',
    },
    {
      type: 'autoPlant' as const,
      name: 'Auto-Planter (Seed Drill)',
      icon: '🌱',
      level: automation.autoPlantLevel,
      enabled: automation.autoPlantEnabled,
      toggleKey: 'autoPlantEnabled' as keyof AutomationState,
      tiers: AUTOMATION_TIERS.autoPlant,
      summary: 'Sows currently selected seeds into empty prepared soil.',
    },
    {
      type: 'autoFeed' as const,
      name: 'Auto-Feeder (Trough Dispenser)',
      icon: '🐮',
      level: automation.autoFeedLevel,
      enabled: automation.autoFeedEnabled,
      toggleKey: 'autoFeedEnabled' as keyof AutomationState,
      tiers: AUTOMATION_TIERS.autoFeed,
      summary: 'Grooms livestock, tenders pets, and gathers fresh milk, eggs, & wool.',
    },
    {
      type: 'autoWater' as const,
      name: 'Auto-Water (Pivot Sprinklers)',
      icon: '💧',
      level: automation.autoWaterLevel,
      enabled: automation.autoWaterEnabled,
      toggleKey: 'autoWaterEnabled' as keyof AutomationState,
      tiers: AUTOMATION_TIERS.autoWater,
      summary: 'Sprays dry plots regularly, keeping crops at 1.8x accelerated growth.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">Homestead Automation & Upgrades</h2>
              <p className="text-xs text-slate-400">Upgrade auto-harvest, auto-plant, auto-feed, and irrigation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-amber-300 border border-amber-500/30">
              <span>🪙</span>
              <span>{gameState.coins}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-rose-300 border border-rose-500/30">
              <span>🎀</span>
              <span>{gameState.gems}</span>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {modules.map((mod) => {
            const isUnlocked = mod.level > 0;
            const currentTier = mod.tiers.find((t) => t.level === mod.level);
            const nextTier = mod.tiers.find((t) => t.level === mod.level + 1);

            return (
              <div
                key={mod.type}
                className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 shadow-md space-y-3"
              >
                {/* Module Title and Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-xl shrink-0">
                      {mod.icon}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <span>{mod.name}</span>
                        {isUnlocked ? (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                            Tier {mod.level}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold">Not Installed</span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{mod.summary}</p>
                    </div>
                  </div>

                  {/* On/Off Switch if unlocked */}
                  {isUnlocked && (
                    <button
                      onClick={() => {
                        sound.playTap();
                        onToggleAutomation(mod.toggleKey);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        mod.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                          mod.enabled ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Current Active Specs if unlocked */}
                {isUnlocked && currentTier && (
                  <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-emerald-300">{currentTier.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Cycle: Every {currentTier.intervalSec}s · {mod.enabled ? 'Active ✅' : 'Paused ⏸️'}
                    </span>
                  </div>
                )}

                {/* Upgrade Button or Install Button */}
                {nextTier ? (
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-700/40">
                    <div className="text-[11px] text-slate-300 min-w-0">
                      <span className="font-semibold text-amber-300 block truncate">
                        {isUnlocked ? `Upgrade: ${nextTier.name}` : `Install: ${nextTier.name}`}
                      </span>
                      <span className="text-slate-400 text-[10px] block truncate">{nextTier.desc}</span>
                    </div>

                    <button
                      disabled={gameState.coins < nextTier.cost || gameState.gems < nextTier.gems}
                      onClick={() => {
                        sound.playUpgrade();
                        onUpgradeAutomation(mod.type, nextTier.level, nextTier.cost, nextTier.gems);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                        gameState.coins >= nextTier.cost && gameState.gems >= nextTier.gems
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>🪙 {nextTier.cost}</span>
                      <span>🎀 {nextTier.gems}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 font-semibold text-center py-1">
                    ✨ Maximum Technology Efficiency Reached
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
