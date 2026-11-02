import React from 'react';
import { GameState } from '../../types/game';
import { CROPS } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface InventoryModalProps {
  gameState: GameState;
  onClose: () => void;
  onSellItem: (itemKey: string, count: number, pricePerUnit: number) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  gameState,
  onClose,
  onSellItem,
}) => {
  const itemsMeta: Record<string, { name: string; icon: string; price: number; category: string }> = {
    wheat: { name: 'Golden Wheat', icon: '🌾', price: 15, category: 'Crops' },
    strawberry: { name: 'Sweet Strawberry', icon: '🍓', price: 38, category: 'Crops' },
    carrot: { name: 'Crisp Carrot', icon: '🥕', price: 48, category: 'Crops' },
    corn: { name: 'Sun Sweet Corn', icon: '🌽', price: 72, category: 'Crops' },
    sunflower: { name: 'Sunburst Sunflower', icon: '🌻', price: 96, category: 'Crops' },
    pumpkin: { name: 'Spiced Pumpkin', icon: '🎃', price: 130, category: 'Crops' },
    frostberry: { name: 'Glacier Frostberry', icon: '🫐', price: 125, category: 'Crops' },
    palay: { name: 'Golden Palay (Rice)', icon: '🌾', price: 65, category: 'Crops' },
    ube: { name: 'Ube Yam (Purple Yam)', icon: '🍠', price: 95, category: 'Crops' },
    mango: { name: 'Carabao Mango', icon: '🥭', price: 140, category: 'Crops' },
    tilapia: { name: 'Fresh Tilapia', icon: '🐟', price: 55, category: 'Aquaculture' },
    milkfish: { name: 'Bangus (Milkfish)', icon: '🐟', price: 85, category: 'Aquaculture' },
    egg: { name: 'Fresh Farm Egg', icon: '🥚', price: 25, category: 'Produce' },
    milk: { name: 'Creamy Milk', icon: '🥛', price: 60, category: 'Produce' },
    wool: { name: 'Merino Wool', icon: '🧶', price: 75, category: 'Produce' },
    ostrich_egg: { name: 'Giant Ostrich Egg', icon: '🪺', price: 120, category: 'Produce' },
    rabbit_wool: { name: 'Soft Angora Wool', icon: '🐇', price: 80, category: 'Produce' },
    seed_wheat: { name: 'Wheat Seeds', icon: '🌱', price: 3, category: 'Seeds' },
    seed_strawberry: { name: 'Strawberry Seeds', icon: '🌱', price: 7, category: 'Seeds' },
    seed_carrot: { name: 'Carrot Seeds', icon: '🌱', price: 9, category: 'Seeds' },
    seed_corn: { name: 'Corn Seeds', icon: '🌱', price: 13, category: 'Seeds' },
    seed_sunflower: { name: 'Sunflower Seeds', icon: '🌱', price: 18, category: 'Seeds' },
    seed_pumpkin: { name: 'Pumpkin Seeds', icon: '🌱', price: 22, category: 'Seeds' },
    seed_frostberry: { name: 'Frostberry Seeds', icon: '🌱', price: 20, category: 'Seeds' },
    seed_palay: { name: 'Palay Rice Seeds', icon: '🌱', price: 10, category: 'Seeds' },
    seed_ube: { name: 'Ube Seedlings', icon: '🌱', price: 16, category: 'Seeds' },
    seed_mango: { name: 'Carabao Mango Sapling', icon: '🌱', price: 24, category: 'Seeds' },

    // Rare Harvests (2x-2.5x value)
    rare_plump_wheat: { name: 'Plump Amber Wheat', icon: '🌾', price: 30, category: 'Rare Harvest' },
    rare_plump_egg: { name: 'Speckled Farm Egg', icon: '🥚', price: 50, category: 'Rare Harvest' },
    rare_sugar_strawberry: { name: 'Sugar Heart Berry', icon: '🍓', price: 76, category: 'Rare Harvest' },
    rare_golden_carrot: { name: 'Crisp Golden Carrot', icon: '🥕', price: 96, category: 'Rare Harvest' },
    rare_rainbow_corn: { name: 'Rainbow Kernel Corn', icon: '🌽', price: 144, category: 'Rare Harvest' },
    rare_fire_sunflower: { name: 'Sunfire Blossom', icon: '🌻', price: 192, category: 'Rare Harvest' },
    rare_sugar_pumpkin: { name: 'Cinnamon Sugar Pumpkin', icon: '🎃', price: 260, category: 'Rare Harvest' },
    rare_glacier_berry: { name: 'Glacier Ice Berry', icon: '🫐', price: 250, category: 'Rare Harvest' },
    rare_jasmine_palay: { name: 'Fragrant Jasmine Palay', icon: '🌾', price: 140, category: 'Rare Harvest' },
    rare_royal_ube: { name: 'Royal Bohol Ube', icon: '🍠', price: 210, category: 'Rare Harvest' },
    rare_honey_mango: { name: 'Honey Nectar Mango', icon: '🥭', price: 300, category: 'Rare Harvest' },
    rare_cream_milk: { name: 'Cream Top Rich Milk', icon: '🥛', price: 120, category: 'Rare Harvest' },
    rare_silk_wool: { name: 'Silk Merino Fleece', icon: '🧶', price: 150, category: 'Rare Harvest' },
    rare_spotted_ostrich_egg: { name: 'Speckled Giant Ostrich Egg', icon: '🪺', price: 260, category: 'Rare Harvest' },
    rare_angora_fur: { name: 'Fluffy Angora Fur', icon: '🐇', price: 180, category: 'Rare Harvest' },
    rare_golden_tilapia: { name: 'Golden River Tilapia', icon: '🐟', price: 120, category: 'Rare Harvest' },
    rare_silver_bangus: { name: 'Giant Dagupan Bangus', icon: '🐟', price: 190, category: 'Rare Harvest' },

    // Epic Harvests (4x value)
    epic_shiny_wheat: { name: 'Shiny Sunlit Wheat', icon: '✨', price: 60, category: 'Epic Harvest' },
    epic_shiny_egg: { name: 'Shiny Egg', icon: '✨', price: 100, category: 'Epic Harvest' },
    epic_ruby_strawberry: { name: 'Ruby Jewel Strawberry', icon: '💎', price: 152, category: 'Epic Harvest' },
    epic_giant_carrot: { name: 'Colossal King Carrot', icon: '🥕✨', price: 192, category: 'Epic Harvest' },
    epic_gem_corn: { name: 'Glass Gem Indian Corn', icon: '💎', price: 288, category: 'Epic Harvest' },
    epic_radiant_sunflower: { name: 'Radiant Corona Blossom', icon: '✨', price: 384, category: 'Epic Harvest' },
    epic_giant_pumpkin: { name: 'Colossal Giant Pumpkin', icon: '🎃✨', price: 520, category: 'Epic Harvest' },
    epic_aurora_berry: { name: 'Boreal Aurora Berry', icon: '🌌', price: 500, category: 'Epic Harvest' },
    epic_pearl_palay: { name: 'Pearl White Heirloom Palay', icon: '🦪', price: 260, category: 'Epic Harvest' },
    epic_velvet_ube: { name: 'Velvet Crown Deep Ube', icon: '👑', price: 420, category: 'Epic Harvest' },
    epic_royal_mango: { name: 'Royal Sunburst Mango', icon: '🌟', price: 600, category: 'Epic Harvest' },
    epic_clotted_milk: { name: 'Golden Clotted Milk', icon: '🥛✨', price: 240, category: 'Epic Harvest' },
    epic_rainbow_wool: { name: 'Prismatic Spun Wool', icon: '🌈', price: 300, category: 'Epic Harvest' },
    epic_marble_ostrich_egg: { name: 'Marble Ostrich Egg', icon: '🪨✨', price: 480, category: 'Epic Harvest' },
    epic_velvet_angora: { name: 'Velvet Royal Angora', icon: '🧶✨', price: 320, category: 'Epic Harvest' },
    epic_emerald_tilapia: { name: 'Emerald Lake Tilapia', icon: '🐠✨', price: 220, category: 'Epic Harvest' },
    epic_king_bangus: { name: 'Silver King Bangus', icon: '👑', price: 340, category: 'Epic Harvest' },

    // Legendary Harvests (8x-10x value)
    legendary_bushy_wheat: { name: 'Bushy Wheat', icon: '👑', price: 120, category: 'Legendary' },
    legendary_golden_egg: { name: 'Golden Egg', icon: '👑', price: 250, category: 'Legendary' },
    legendary_starburst_strawberry: { name: 'Starburst Strawberry', icon: '🌟', price: 304, category: 'Legendary' },
    legendary_aurora_carrot: { name: 'Aurora Prismatic Carrot', icon: '🌈', price: 384, category: 'Legendary' },
    legendary_solar_corn: { name: 'Sunburst Solar Corn', icon: '☀️', price: 576, category: 'Legendary' },
    legendary_solar_sunflower: { name: 'Celestial Sun Core', icon: '🌟', price: 768, category: 'Legendary' },
    legendary_mythic_pumpkin: { name: 'Mythic Cinder Pumpkin', icon: '👑', price: 1300, category: 'Legendary' },
    legendary_starlight_berry: { name: 'Starlight Frozen Berry', icon: '❄️👑', price: 1000, category: 'Legendary' },
    legendary_imperial_palay: { name: 'Imperial Golden Palay', icon: '🌾👑', price: 650, category: 'Legendary' },
    legendary_celestial_ube: { name: 'Celestial Amethyst Ube', icon: '💎', price: 950, category: 'Legendary' },
    legendary_divine_mango: { name: 'Divine Golden Mango', icon: '🥭👑', price: 1400, category: 'Legendary' },
    legendary_carabao_nectar: { name: 'Mythic Carabao Nectar Milk', icon: '🥛👑', price: 480, category: 'Legendary' },
    legendary_golden_fleece: { name: 'Golden Fleece of Legend', icon: '🧶👑', price: 600, category: 'Legendary' },
    legendary_prismatic_ostrich_egg: { name: 'Prismatic Gem Ostrich Egg', icon: '🪺👑', price: 1200, category: 'Legendary' },
    legendary_starlight_angora: { name: 'Golden Starlight Angora', icon: '🌟👑', price: 800, category: 'Legendary' },
    legendary_diamond_tilapia: { name: 'Diamond Crown Tilapia', icon: '💎👑', price: 550, category: 'Legendary' },
    legendary_dragon_bangus: { name: 'Imperial Dragon Bangus', icon: '🐉👑', price: 850, category: 'Legendary' },
  };

  const storedEntries = Object.entries(gameState.inventory).filter(([_, count]) => count > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">Barn Granary & Storage</h2>
              <p className="text-xs text-slate-400">Stored harvests, farm produce & seed stocks</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {storedEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Your granary is currently empty. Sow and harvest crops or care for livestock!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {storedEntries.map(([itemKey, count]) => {
                const meta = itemsMeta[itemKey] || {
                  name: itemKey,
                  icon: '📦',
                  price: 10,
                  category: 'Goods',
                };

                const isSellable = !itemKey.startsWith('seed_');
                const isLegendary = itemKey.startsWith('legendary_');
                const isEpic = itemKey.startsWith('epic_');
                const isRare = itemKey.startsWith('rare_');

                let cardStyle = 'bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/50';
                if (isLegendary) {
                  cardStyle = 'bg-gradient-to-r from-amber-950/50 to-slate-800 border-amber-400/80 shadow-lg shadow-amber-950/40';
                } else if (isEpic) {
                  cardStyle = 'bg-gradient-to-r from-purple-950/50 to-slate-800 border-purple-400/80 shadow-md';
                } else if (isRare) {
                  cardStyle = 'bg-gradient-to-r from-sky-950/40 to-slate-800 border-sky-400/70';
                }

                return (
                  <div
                    key={itemKey}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${cardStyle}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                          isLegendary
                            ? 'bg-amber-500/20 border border-amber-400/50'
                            : isEpic
                              ? 'bg-purple-500/20 border border-purple-400/50'
                              : isRare
                                ? 'bg-sky-500/20 border border-sky-400/50'
                                : 'bg-slate-700/60'
                        }`}
                      >
                        {meta.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white truncate">{meta.name}</span>
                          {isLegendary && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400 font-bold">
                              👑 LEGENDARY
                            </span>
                          )}
                          {isEpic && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-400 font-bold">
                              ✨ EPIC
                            </span>
                          )}
                          {isRare && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/20 text-sky-300 border border-sky-400 font-bold">
                              ⭐ RARE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono tabular-nums text-emerald-300">
                          Count: {count}
                        </span>
                      </div>
                    </div>

                    {isSellable && (
                      <button
                        onClick={() => {
                          sound.playCoin();
                          onSellItem(itemKey, 1, meta.price);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                          isLegendary
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md'
                            : isEpic
                              ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50 hover:bg-purple-500/40'
                              : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <span>Sell</span>
                        <span className="font-mono tabular-nums">🪙 {meta.price}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Farm Statistics */}
          <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Homestead Record</span>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="bg-slate-800/50 p-2 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Harvested</span>
                <span className="text-amber-300 font-bold text-sm tabular-nums">
                  {gameState.totalCropsHarvested}
                </span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Animal Petted</span>
                <span className="text-rose-300 font-bold text-sm tabular-nums">
                  {gameState.totalAnimalsPetted}
                </span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Days Passed</span>
                <span className="text-emerald-300 font-bold text-sm tabular-nums">
                  {gameState.totalDays}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
