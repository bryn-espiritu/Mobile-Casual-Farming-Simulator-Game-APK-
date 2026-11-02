import React from 'react';
import { GameState, Season, SeasonalTask } from '../../types/game';
import { SEASONS_INFO } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface SeasonalTasksModalProps {
  gameState: GameState;
  onClose: () => void;
  onClaimTask: (task: SeasonalTask) => void;
  onAdvanceSeason: () => void;
}

export const SeasonalTasksModal: React.FC<SeasonalTasksModalProps> = ({
  gameState,
  onClose,
  onClaimTask,
  onAdvanceSeason,
}) => {
  const currentSeason = gameState.season;
  const info = SEASONS_INFO[currentSeason];

  const seasonIcons: Record<Season, string> = {
    spring: '🌸',
    summer: '🌻',
    autumn: '🍁',
    winter: '❄️',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{seasonIcons[currentSeason]}</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">{info.name}</h2>
              <p className="text-xs text-emerald-400 font-medium">{info.tag}</p>
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

        {/* Season Atmosphere Description banner */}
        <div className="px-5 py-3 bg-emerald-950/30 border-b border-slate-800 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{info.description}"
          </p>

          <button
            onClick={() => {
              sound.playSeasonChange();
              onAdvanceSeason();
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-sm shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            Advance Season ➔
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Seasonal Cozy Goals (Day {gameState.seasonDay} of 7)
          </div>

          {gameState.tasks.map((task) => {
            const isCompleted = task.currentCount >= task.targetCount;
            const progressPercent = Math.min(100, Math.round((task.currentCount / task.targetCount) * 100));

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  task.claimed
                    ? 'bg-slate-800/30 border-slate-700/40 opacity-50'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{task.title}</span>
                      {isCompleted && !task.claimed && (
                        <span className="text-[10px] text-amber-300 font-normal">Ready!</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">{task.description}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold shrink-0">
                    <span className="text-amber-300">🪙 +{task.rewardCoins}</span>
                    <span className="text-rose-300">🎀 +{task.rewardGems}</span>
                  </div>
                </div>

                {/* Progress bar & Claim button */}
                <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-700/40">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-slate-300 min-w-[40px] text-right">
                      {task.currentCount}/{task.targetCount}
                    </span>
                  </div>

                  {task.claimed ? (
                    <span className="text-xs font-semibold text-slate-500 px-3 py-1">Claimed</span>
                  ) : (
                    <button
                      disabled={!isCompleted}
                      onClick={() => {
                        sound.playCoin();
                        sound.playLevelUp();
                        onClaimTask(task);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? 'Claim Reward' : 'In Progress'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
