import React, { useState } from 'react';
import { CropType, GameState } from '../../types/game';
import { CROPS, KALABAW_UPGRADES } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface ShopModalProps {
  gameState: GameState;
  onClose: () => void;
  onBuySeed: (cropType: CropType, cost: number) => void;
  onBuyItem: (itemKey: string, itemName: string, cost: number, category: string) => void;
  onOpenHouseCustomizer: () => void;
  onOpenAutomation: () => void;
  onUpgradeKalabawPlow?: (nextTier: number, cost: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  gameState,
  onClose,
  onBuySeed,
  onBuyItem,
  onOpenHouseCustomizer,
  onOpenAutomation,
  onUpgradeKalabawPlow,
}) => {
  const [activeTab, setActiveTab] = useState<'seeds' | 'buildings' | 'animals' | 'decor'>('seeds');

  const cropKeys = Object.keys(CROPS) as CropType[];

  const buildingsCatalog = [
    { id: 'building_bahay_kubo', name: 'Bahay Kubo', cost: 380, icon: '🛖', desc: 'Traditional bamboo stilt house with woven nipa palm roof.', category: 'building', minLevel: 1 },
    { id: 'building_fish_pond', name: 'Palaisdaan Fish Pond', cost: 320, icon: '🐟', desc: 'Aquaculture pond stocked with Bangus (milkfish) & Tilapia.', category: 'building', minLevel: 1 },
    { id: 'building_cottage', name: 'Guest Cottage', cost: 420, icon: '🏡', desc: 'Charming stone cottage retreat for visitors.', category: 'building', minLevel: 2 },
    { id: 'building_greenhouse', name: 'Botanical Greenhouse', cost: 550, icon: '🏛️', desc: 'Glass conservatory allowing plants to thrive all seasons.', category: 'building', minLevel: 2 },
    { id: 'building_gazebo', name: 'Floral Garden Gazebo', cost: 260, icon: '🌸', desc: 'Open-air timber gazebo with climbing climbing roses.', category: 'building', minLevel: 1 },
    { id: 'building_shed', name: 'Artisan Workshop Shed', cost: 320, icon: '🛖', desc: 'Country workshop for woodcrafting and storage.', category: 'building', minLevel: 1 },
    { id: 'building_well', name: 'Stone Brick Well', cost: 180, icon: '🪣', desc: 'Deep aquifer well that hydrates adjacent soil.', category: 'building', minLevel: 1 },
    { id: 'building_windmill', name: 'Valley Windmill', cost: 600, icon: '⚙️', desc: 'Grinds wheat into flour and yields bonus revenue.', category: 'building', minLevel: 3 },
  ];

  const animalsCatalog = [
    {
      id: 'animal_chicken',
      name: 'Heritage Chicken',
      cost: 120,
      icon: '🐔',
      produce: 'Fresh Eggs 🥚',
      desc: 'Heritage hen producing fresh eggs daily. +1 capacity unlocked every 3rd level (Lv 3, 6, 9...).',
      minLevel: 3,
      animalType: 'chicken',
    },
    {
      id: 'animal_cow',
      name: 'Jersey Dairy Cow',
      cost: 450,
      icon: '🐄',
      produce: 'Creamy Milk 🥛',
      desc: 'Gentle dairy cow providing creamy milk. +1 capacity unlocked every 10th level (Lv 10, 20, 30...).',
      minLevel: 10,
      animalType: 'cow',
    },
    {
      id: 'animal_sheep',
      name: 'Merino Sheep',
      cost: 380,
      icon: '🐑',
      produce: 'Soft Wool 🧶',
      desc: 'Fluffy Merino sheep for sweater wool. +1 capacity unlocked every 5th tier (Lv 15, 25, 35...).',
      minLevel: 15,
      animalType: 'sheep',
    },
    {
      id: 'animal_carabao',
      name: 'Kalabaw (Water Buffalo)',
      cost: 50000,
      icon: '🐃',
      produce: 'Carabao Milk 🥛',
      desc: 'Philippine workhorse! Plows multiple fields at once. Requires Level 20 & 50,000 Coins. Upgradable plow radius.',
      minLevel: 20,
      animalType: 'carabao',
    },
    {
      id: 'animal_rabbit',
      name: 'Angora Rabbit',
      cost: 220,
      icon: '🐇',
      produce: 'Angora Wool 🧶',
      desc: 'Fluffy country bunny yielding soft spun angora wool.',
      minLevel: 2,
      animalType: 'rabbit',
    },
    {
      id: 'animal_ostrich',
      name: 'Giant Ostrich',
      cost: 520,
      icon: '🪺',
      produce: 'Ostrich Egg 🪺',
      desc: 'Majestic bird producing massive eggs with rare golden egg variants.',
      minLevel: 4,
      animalType: 'ostrich',
    },
    {
      id: 'animal_dog',
      name: 'Golden Retriever',
      cost: 450,
      icon: '🐕',
      produce: 'Joy & Luck 💖',
      desc: 'Loyal farm dog that brings warmth & luck.',
      minLevel: 3,
      animalType: 'dog',
    },
  ];

  const decorCatalog = [
    { id: 'stone_path', name: 'Cobblestone Pavers (x4)', cost: 40, icon: '🪨', desc: 'Smooth country walking stones.', category: 'decor' },
    { id: 'wood_path', name: 'Timber Planks (x4)', cost: 50, icon: '🪵', desc: 'Warm rustic wooden boardwalks.', category: 'decor' },
    { id: 'flower_bed', name: 'Wildflower Patch', cost: 65, icon: '🌸', desc: 'Attracts honeybees and brightens fields.', category: 'decor' },
    { id: 'fence', name: 'Picket Fence (x4)', cost: 45, icon: '🪵', desc: 'Keep pastures neat and cozy.', category: 'decor' },
    { id: 'tree_apple', name: 'Apple Sapling', cost: 150, icon: '🍏', desc: 'Bears crisp red apples every autumn.', category: 'decor' },
    { id: 'tree_cherry', name: 'Cherry Blossom Tree', cost: 180, icon: '🌸', desc: 'Gorgeous pink blossom canopy.', category: 'decor' },
    { id: 'lantern', name: 'Cozy Iron Lantern', cost: 90, icon: '🏮', desc: 'Casts a warm circular glow at night.', category: 'decor' },
    { id: 'scarecrow', name: 'Village Scarecrow', cost: 110, icon: '🌾', desc: 'Friendly straw watcher protecting crops.', category: 'decor' },
    { id: 'water_pond', name: 'Koi & Duck Pond', cost: 220, icon: '🦆', desc: 'Reflective pond with gentle water ripples.', category: 'decor' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏪</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">Valley General Store</h2>
              <p className="text-xs text-slate-400">Quality seeds, architecture, livestock & homestead supplies</p>
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

        {/* Quick Hub Shortcuts */}
        <div className="px-4 py-2 bg-emerald-950/40 border-b border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              sound.playTap();
              onClose();
              onOpenHouseCustomizer();
            }}
            className="flex-1 py-1.5 px-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🏡</span>
            <span>House Interior & Furniture</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
              onOpenAutomation();
            }}
            className="flex-1 py-1.5 px-2.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>⚙️</span>
            <span>Automation & Upgrades</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-slate-800 bg-slate-950/30 overflow-x-auto">
          {[
            { id: 'seeds', label: 'Crop Seeds', icon: '🌱' },
            { id: 'buildings', label: 'Buildings & Houses', icon: '🏡' },
            { id: 'animals', label: 'Livestock', icon: '🐮' },
            { id: 'decor', label: 'Paths & Decor', icon: '🌸' },
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

        {/* Catalog Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {activeTab === 'seeds' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {cropKeys.map((type) => {
                const crop = CROPS[type];
                const seedKey = `seed_${type}`;
                const owned = gameState.inventory[seedKey] ?? 0;
                const inSeason = crop.allowedSeasons ? crop.allowedSeasons.includes(gameState.season) : true;
                const canAfford = gameState.coins >= crop.seedCost;

                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 bg-slate-800/60 hover:bg-slate-800/90 rounded-2xl border border-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-2xl shrink-0">
                        {crop.emoji}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white truncate">{crop.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                              inSeason
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {inSeason ? `✓ ${gameState.season}` : `Season: ${crop.allowedSeasons.join('/')}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span>⏱️ {crop.growthTimeSec}s</span>
                          <span>·</span>
                          <span>Sell: 🪙{crop.sellPrice}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400">Owned: {owned}</span>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playCoin();
                        onBuySeed(type, crop.seedCost);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>🪙</span>
                      <span className="font-mono tabular-nums">{crop.seedCost}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'buildings' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {buildingsCatalog.map((b) => {
                const canAfford = gameState.coins >= b.cost;
                const levelOk = gameState.level >= b.minLevel;

                return (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shrink-0">
                        {b.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{b.name}</span>
                          {!levelOk && (
                            <span className="text-[10px] text-amber-400 font-mono">Lv {b.minLevel}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{b.desc}</p>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford || !levelOk}
                      onClick={() => {
                        sound.playHammer();
                        onBuyItem(b.id, b.name, b.cost, 'building');
                      }}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        canAfford && levelOk
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Build for 🪙 {b.cost}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'animals' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {animalsCatalog.map((an) => {
                const canAfford = gameState.coins >= an.cost;
                const levelOk = gameState.level >= an.minLevel;

                return (
                  <div
                    key={an.id}
                    className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0">
                        {an.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{an.name}</span>
                          {!levelOk && (
                            <span className="text-[10px] text-amber-400 font-mono">Lv {an.minLevel}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{an.desc}</p>
                        <span className="text-[10px] text-rose-300 font-medium mt-1">Yields: {an.produce}</span>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford || !levelOk}
                      onClick={() => {
                        sound.playCoin();
                        onBuyItem(an.id, an.name, an.cost, 'animal');
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        canAfford && levelOk
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Adopt for 🪙 {an.cost}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'decor' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {decorCatalog.map((item) => {
                const canAfford = gameState.coins >= item.cost;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-xl shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{item.name}</span>
                        <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        sound.playCoin();
                        onBuyItem(item.id, item.name, item.cost, 'decor');
                      }}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm active:scale-95'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>🪙 {item.cost}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
