import React from 'react';
import { GameState, TownOrder } from '../../types/game';
import { sound } from '../../services/audio';

interface OrderBoardModalProps {
  gameState: GameState;
  onClose: () => void;
  onFulfillOrder: (order: TownOrder) => void;
}

export const OrderBoardModal: React.FC<OrderBoardModalProps> = ({
  gameState,
  onClose,
  onFulfillOrder,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">Village Delivery Board</h2>
              <p className="text-xs text-slate-400">Fulfill rustic orders for the townspeople of Willow Creek</p>
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

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {gameState.orders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              All orders are fulfilled for now! Check back after morning dew.
            </div>
          ) : (
            gameState.orders.map((order) => {
              // Check if player has all required items
              const canFulfill = order.requirements.every((req) => {
                const count = gameState.inventory[req.itemKey] ?? 0;
                return count >= req.count;
              });

              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    order.completed
                      ? 'bg-slate-800/30 border-emerald-500/20 opacity-60'
                      : 'bg-slate-800/70 border-slate-700/60 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm"
                        style={{ backgroundColor: order.avatarColor }}
                      >
                        {order.customerName[0]}
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-white">{order.customerName}</h3>
                        <span className="text-[11px] text-emerald-300 font-medium">{order.customerTitle}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <span className="text-amber-300">🪙 +{order.rewardCoins}</span>
                      <span className="text-sky-300">✨ +{order.rewardXP} XP</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic mb-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                    "{order.dialogue}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-700/50">
                    {/* Requirements checklist */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium">Needs:</span>
                      {order.requirements.map((req) => {
                        const owned = gameState.inventory[req.itemKey] ?? 0;
                        const hasEnough = owned >= req.count;

                        return (
                          <div
                            key={req.itemKey}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border ${
                              hasEnough
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            <span>{req.icon}</span>
                            <span>{req.itemName}</span>
                            <span className="font-mono tabular-nums font-bold">
                              ({owned}/{req.count})
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Fulfill CTA */}
                    <button
                      disabled={!canFulfill || order.completed}
                      onClick={() => {
                        sound.playHarvest();
                        sound.playCoin();
                        onFulfillOrder(order);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        order.completed
                          ? 'bg-slate-700 text-emerald-400 cursor-default'
                          : canFulfill
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {order.completed ? 'Delivered ✓' : canFulfill ? 'Deliver Order' : 'Missing Items'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
