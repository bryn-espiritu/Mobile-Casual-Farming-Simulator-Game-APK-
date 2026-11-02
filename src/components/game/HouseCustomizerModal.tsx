import React, { useState } from 'react';
import { GameState, PlacedFurniture } from '../../types/game';
import { FURNITURE_CATALOG, HOUSE_LEVELS } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface HouseCustomizerModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpgradeHouseLevel: (nextLevel: number, coinCost: number, gemCost: number) => void;
  onUpdateColors: (exteriorColor: string, roofColor: string) => void;
  onPlaceFurniture: (furnitureId: string, name: string, category: string, icon: string, x: number, y: number, cost: number) => void;
  onRemoveFurniture: (placedId: string) => void;
}

export const HouseCustomizerModal: React.FC<HouseCustomizerModalProps> = ({
  gameState,
  onClose,
  onUpgradeHouseLevel,
  onUpdateColors,
  onPlaceFurniture,
  onRemoveFurniture,
}) => {
  const [activeTab, setActiveTab] = useState<'interior' | 'furniture_shop' | 'exterior_renovation'>('interior');
  const [selectedFurnitureToPlace, setSelectedFurnitureToPlace] = useState<typeof FURNITURE_CATALOG[0] | null>(null);

  const house = gameState.house || {
    level: 1,
    exteriorColor: '#b91c1c',
    roofColor: '#450a0a',
    wallStyle: 'cream_plaster',
    flooring: 'hardwood_oak',
    placedFurniture: [],
  };

  const currentLevelInfo = HOUSE_LEVELS.find((l) => l.level === house.level) || HOUSE_LEVELS[0];
  const nextLevelInfo = HOUSE_LEVELS.find((l) => l.level === house.level + 1);

  // Exterior Paint Swatches
  const exteriorSwatches = [
    { name: 'Heritage Barn Red', hex: '#b91c1c' },
    { name: 'Sage Forest Green', hex: '#15803d' },
    { name: 'Cotswold Warm Honey', hex: '#d97706' },
    { name: 'Coastal Navy', hex: '#1e3a8a' },
    { name: 'Lilac Plum', hex: '#7e22ce' },
    { name: 'Alpine Slate', hex: '#334155' },
  ];

  const roofSwatches = [
    { name: 'Dark Cedar', hex: '#450a0a' },
    { name: 'Charcoal Shingle', hex: '#1e293b' },
    { name: 'Verdigris Copper', hex: '#0f766e' },
    { name: 'Weathered Oak', hex: '#78350f' },
  ];

  // Room grid size (6x6)
  const ROOM_SIZE = 6;

  const handleTileClick = (rx: number, ry: number) => {
    // If a furniture item from catalog is selected, place it here!
    if (selectedFurnitureToPlace) {
      if (gameState.coins < selectedFurnitureToPlace.cost) return;

      // Check if spot already occupied
      const existing = house.placedFurniture.find((f) => f.x === rx && f.y === ry);
      if (existing) {
        onRemoveFurniture(existing.id);
      }

      sound.playHammer();
      onPlaceFurniture(
        selectedFurnitureToPlace.id,
        selectedFurnitureToPlace.name,
        selectedFurnitureToPlace.category,
        selectedFurnitureToPlace.icon,
        rx,
        ry,
        selectedFurnitureToPlace.cost
      );
      setSelectedFurnitureToPlace(null);
    } else {
      // Tap existing item to remove / lift
      const existing = house.placedFurniture.find((f) => f.x === rx && f.y === ry);
      if (existing) {
        sound.playTap();
        onRemoveFurniture(existing.id);
      }
    }
  };

  // Compute total comfort rating
  const totalComfort = house.placedFurniture.reduce((acc, f) => {
    const item = FURNITURE_CATALOG.find((cat) => cat.id === f.furnitureId);
    return acc + (item?.comfortBonus || 10);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏡</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">Homestead Architecture & Interior</h2>
              <p className="text-xs text-emerald-400 font-medium">
                {currentLevelInfo.name} · Comfort Rating: {totalComfort} 💖
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-amber-300 border border-amber-500/30">
              <span>🪙</span>
              <span>{gameState.coins}</span>
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

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40">
          {[
            { id: 'interior', label: 'Room Floorplan', icon: '🛋️' },
            { id: 'furniture_shop', label: 'Furniture Catalog', icon: '🪑' },
            { id: 'exterior_renovation', label: 'Architecture & Paint', icon: '🎨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTap();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: INTERACTIVE ROOM FLOORPLAN */}
          {activeTab === 'interior' && (
            <div className="flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-slate-300">
                  {selectedFurnitureToPlace ? (
                    <span className="text-amber-300 animate-pulse">
                      Tap a room tile to place: {selectedFurnitureToPlace.name} ({selectedFurnitureToPlace.icon})
                    </span>
                  ) : (
                    <span>Tap any room tile to place furniture or tap placed items to remove</span>
                  )}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Capacity: {house.placedFurniture.length}/{currentLevelInfo.maxFurniture}
                </span>
              </div>

              {/* 6x6 Interactive Interior Floorplan */}
              <div className="relative p-4 bg-amber-950/20 border-4 border-amber-900/60 rounded-3xl shadow-inner max-w-sm sm:max-w-md w-full">
                {/* Cozy room wallpaper top border */}
                <div className="w-full h-4 bg-amber-900/40 rounded-t-xl mb-3 flex items-center justify-around px-4">
                  <span className="w-8 h-1 bg-amber-700/50 rounded-full" />
                  <span className="w-8 h-1 bg-amber-700/50 rounded-full" />
                  <span className="w-8 h-1 bg-amber-700/50 rounded-full" />
                </div>

                <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                  {Array.from({ length: ROOM_SIZE }).map((_, ry) =>
                    Array.from({ length: ROOM_SIZE }).map((_, rx) => {
                      const placed = house.placedFurniture.find((f) => f.x === rx && f.y === ry);

                      return (
                        <button
                          key={`${rx}-${ry}`}
                          onClick={() => handleTileClick(rx, ry)}
                          className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            placed
                              ? 'bg-amber-800/40 border-amber-600/60 shadow-sm hover:scale-105 hover:border-rose-400'
                              : selectedFurnitureToPlace
                              ? 'bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-800/40'
                              : 'bg-amber-950/30 border-amber-900/30 hover:bg-amber-900/40'
                          }`}
                        >
                          {placed ? (
                            <>
                              <span className="text-xl sm:text-2xl leading-none">{placed.icon}</span>
                              <span className="text-[9px] font-bold text-amber-200 truncate max-w-[42px] leading-tight mt-0.5">
                                {placed.name.split(' ')[0]}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-600/40 text-xs">·</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedFurnitureToPlace && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFurnitureToPlace(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl"
                  >
                    Cancel Placement
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FURNITURE CATALOG */}
          {activeTab === 'furniture_shop' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Select furniture to buy and place in your homestead floorplan.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FURNITURE_CATALOG.map((item) => {
                  const canAfford = gameState.coins >= item.cost;
                  const isSelected = selectedFurnitureToPlace?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-950/50 border-emerald-400'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800/90'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate">{item.name}</span>
                          <span className="text-[11px] text-slate-400 truncate">{item.description}</span>
                          <span className="text-[10px] text-rose-300 font-medium mt-0.5">
                            Comfort: +{item.comfortBonus} 💖
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          sound.playTap();
                          setSelectedFurnitureToPlace(item);
                          setActiveTab('interior');
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <span>🪙 {item.cost}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & PAINT UPGRADE */}
          {activeTab === 'exterior_renovation' && (
            <div className="space-y-4">
              {/* House Upgrade Tiers */}
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">House Expansion & Tier</h3>
                    <p className="text-xs text-slate-400">Current: {currentLevelInfo.name}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                    Tier {house.level} of 3
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                  {currentLevelInfo.perk}
                </p>

                {nextLevelInfo ? (
                  <div className="pt-2 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-left w-full sm:w-auto">
                      <span className="text-xs font-bold text-amber-300 block">
                        Upgrade to: {nextLevelInfo.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{nextLevelInfo.perk}</span>
                    </div>

                    <button
                      disabled={gameState.coins < nextLevelInfo.upgradeCost || gameState.gems < nextLevelInfo.gemCost}
                      onClick={() => {
                        sound.playUpgrade();
                        onUpgradeHouseLevel(nextLevelInfo.level, nextLevelInfo.upgradeCost, nextLevelInfo.gemCost);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                        gameState.coins >= nextLevelInfo.upgradeCost && gameState.gems >= nextLevelInfo.gemCost
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg active:scale-95'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Upgrade:</span>
                      <span>🪙 {nextLevelInfo.upgradeCost}</span>
                      <span>🎀 {nextLevelInfo.gemCost}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-300 font-semibold text-center py-1">
                    ✨ Your homestead has reached maximum Grand Estate architectural splendor!
                  </div>
                )}
              </div>

              {/* Exterior Wall Paint Swatches */}
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-3">
                <span className="text-xs font-bold text-white block">Exterior Wall Paint</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {exteriorSwatches.map((color) => {
                    const isSelected = house.exteriorColor === color.hex;

                    return (
                      <button
                        key={color.hex}
                        onClick={() => {
                          sound.playTap();
                          onUpdateColors(color.hex, house.roofColor);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-700 border-amber-400 shadow-sm'
                            : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/20 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Roof Shingle Color Swatches */}
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-3">
                <span className="text-xs font-bold text-white block">Roof Shingle Color</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roofSwatches.map((color) => {
                    const isSelected = house.roofColor === color.hex;

                    return (
                      <button
                        key={color.hex}
                        onClick={() => {
                          sound.playTap();
                          onUpdateColors(house.exteriorColor, color.hex);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-700 border-amber-400 shadow-sm'
                            : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/20 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
