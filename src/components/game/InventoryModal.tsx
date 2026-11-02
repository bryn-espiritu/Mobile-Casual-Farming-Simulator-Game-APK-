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
    egg: { name: 'Fresh Farm Egg', icon: '🥚', price: 25, category: 'Produce' },
    milk: { name: 'Creamy Milk', icon: '🥛', price: 60, category: 'Produce' },
    wool: { name: 'Merino Wool', icon: '🧶', price: 75, category: 'Produce' },
    seed_wheat: { name: 'Wheat Seeds', icon: '🌱', price: 3, category: 'Seeds' },
    seed_strawberry: { name: 'Strawberry Seeds', icon: '🌱', price: 7, category: 'Seeds' },
    seed_carrot: { name: 'Carrot Seeds', icon: '🌱', price: 9, category: 'Seeds' },
    seed_corn: { name: 'Corn Seeds', icon: '🌱', price: 13, category: 'Seeds' },
    seed_sunflower: { name: 'Sunflower Seeds', icon: '🌱', price: 18, category: 'Seeds' },
    seed_pumpkin: { name: 'Pumpkin Seeds', icon: '🌱', price: 22, category: 'Seeds' },
    seed_frostberry: { name: 'Frostberry Seeds', icon: '🌱', price: 20, category: 'Seeds' },
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

                return (
                  <div
                    key={itemKey}
                    className="p-3 bg-slate-800/60 hover:bg-slate-800/90 rounded-2xl border border-slate-700/50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-xl shrink-0">
                        {meta.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{meta.name}</span>
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
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
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
