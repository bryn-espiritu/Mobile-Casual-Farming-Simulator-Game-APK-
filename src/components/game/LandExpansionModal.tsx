import React from 'react';
import { GameState } from '../../types/game';
import { LAND_EXPANSIONS, BARN_UPGRADES } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface LandExpansionModalProps {
  gameState: GameState;
  onClose: () => void;
  onExpandLand: () => void;
  onUpgradeBarn: (level: number, cost: number) => void;
  onOpenHouseCustomizer: () => void;
}

export const LandExpansionModal: React.FC<LandExpansionModalProps> = ({
  gameState,
  onClose,
  onExpandLand,
  onUpgradeBarn,
  onOpenHouseCustomizer,
}) => {
  const currentExpansionIdx = gameState.landExpansions || 0;
  const nextExpansion = LAND_EXPANSIONS[currentExpansionIdx];

  const currentBarn = BARN_UPGRADES.find((b) => b.level === gameState.barnLevel) || BARN_UPGRADES[0];
  const nextBarn = BARN_UPGRADES.find((b) => b.level === (gameState.barnLevel || 1) + 1);

  const houseLevel = gameState.house?.level || 1;
  const barnLevel = gameState.barnLevel || 1;

  const meetsHouseReq = nextExpansion ? houseLevel >= nextExpansion.minHouseLevel : false;
  const meetsBarnReq = nextExpansion ? barnLevel >= nextExpansion.minBarnLevel : false;
  const meetsCoinsReq = nextExpansion ? gameState.coins >= nextExpansion.cost : false;
  const meetsGemsReq = nextExpansion ? gameState.gems >= nextExpansion.gems : false;

  const canExpand = nextExpansion && meetsHouseReq && meetsBarnReq && meetsCoinsReq && meetsGemsReq;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[88vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">🏞️</span>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Naga Farm Territory Expansion</h2>
              <p className="text-xs text-slate-400">
                Expand your agricultural acreage across Camarines Sur valley
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Homestead Status Card */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Naga Farm Cadastral Status
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                {gameState.gridSize}×{gameState.gridSize} Grid ({gameState.gridSize * gameState.gridSize} Tiles)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Homestead House</span>
                <span className="text-amber-300 font-bold text-sm block mt-0.5">
                  Level {houseLevel} {houseLevel >= 2 ? '⭐' : ''}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                  {houseLevel === 1 ? 'Rustic Cabin' : houseLevel === 2 ? 'Country Manor' : 'Grand Estate'}
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Granary & Barn</span>
                <span className="text-emerald-300 font-bold text-sm block mt-0.5">
                  Level {barnLevel} {barnLevel >= 2 ? '⭐' : ''}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                  {currentBarn.name}
                </span>
              </div>
            </div>
          </div>

          {/* Next Land Expansion Section */}
          {nextExpansion ? (
            <div className="p-4 bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/40 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                    Next Available Parcel
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                    {nextExpansion.name}
                    <span className="text-xs font-mono font-normal text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      → {nextExpansion.targetGridSize}×{nextExpansion.targetGridSize} Grid
                    </span>
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-amber-300 font-bold text-sm">🪙 {nextExpansion.cost}</div>
                  <div className="text-rose-300 text-xs">💎 {nextExpansion.gems}</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {nextExpansion.description}
              </p>

              {/* Requirements Checklist */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Expansion Prerequisites
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* House requirement */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">House Level {nextExpansion.minHouseLevel}+</span>
                    {meetsHouseReq ? (
                      <span className="text-emerald-400 font-bold">✓ Met (Lv {houseLevel})</span>
                    ) : (
                      <button
                        onClick={() => {
                          sound.playTap();
                          onClose();
                          onOpenHouseCustomizer();
                        }}
                        className="text-[11px] text-amber-300 font-semibold underline cursor-pointer"
                      >
                        Upgrade House
                      </button>
                    )}
                  </div>

                  {/* Barn requirement */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Barn Level {nextExpansion.minBarnLevel}+</span>
                    {meetsBarnReq ? (
                      <span className="text-emerald-400 font-bold">✓ Met (Lv {barnLevel})</span>
                    ) : (
                      <span className="text-rose-400 font-bold text-[11px]">Needs Barn Lv 2</span>
                    )}
                  </div>

                  {/* Coins requirement */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Coins (🪙 {nextExpansion.cost})</span>
                    <span className={meetsCoinsReq ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {gameState.coins}/{nextExpansion.cost}
                    </span>
                  </div>

                  {/* Gems requirement */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Gems (💎 {nextExpansion.gems})</span>
                    <span className={meetsGemsReq ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {gameState.gems}/{nextExpansion.gems}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (canExpand) {
                    sound.playExpandLand();
                    onExpandLand();
                    onClose();
                  }
                }}
                disabled={!canExpand}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                  canExpand
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-950/60 active:scale-98 animate-pulse'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <span>🏞️</span>
                <span>
                  {canExpand
                    ? `Expand Naga Farm to ${nextExpansion.targetGridSize}×${nextExpansion.targetGridSize}!`
                    : 'Prerequisites Not Met Yet'}
                </span>
              </button>
            </div>
          ) : (
            <div className="p-6 bg-slate-950/60 rounded-2xl border border-emerald-500/30 text-center space-y-2">
              <span className="text-3xl block">👑</span>
              <h3 className="font-bold text-white text-base">Maximum Farm Acreage Reached!</h3>
              <p className="text-xs text-slate-400">
                Naga Farm spans the entire 16×16 fertile valley. You are the master agriculturist of Bicolandia!
              </p>
            </div>
          )}

          {/* Barn Upgrade Section */}
          <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Granary & Silo Upgrades
              </span>
              <span className="text-slate-400">Capacity: {currentBarn.capacity} items</span>
            </div>

            {nextBarn ? (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1.5 bg-slate-800 rounded-lg">{nextBarn.icon}</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">{nextBarn.name}</h4>
                    <p className="text-[11px] text-slate-400">{nextBarn.description}</p>
                    <span className="text-[10px] text-emerald-300 font-mono">
                      Capacity: {nextBarn.capacity} items (+{nextBarn.capacity - currentBarn.capacity})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (gameState.coins >= nextBarn.cost) {
                      sound.playHammer();
                      onUpgradeBarn(nextBarn.level, nextBarn.cost);
                    }
                  }}
                  disabled={gameState.coins < nextBarn.cost}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    gameState.coins >= nextBarn.cost
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  🪙 {nextBarn.cost}
                </button>
              </div>
            ) : (
              <p className="text-slate-400 text-[11px]">
                Your Granary is at the maximum level (Level 3 Grand Silo).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
