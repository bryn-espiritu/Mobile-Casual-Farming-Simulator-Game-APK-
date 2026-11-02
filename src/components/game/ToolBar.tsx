import React, { useState } from 'react';
import { CropType, ToolMode } from '../../types/game';
import { CROPS } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface ToolBarProps {
  selectedTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  selectedSeed: CropType;
  onSelectSeed: (seed: CropType) => void;
  inventory: Record<string, number>;
  onOpenShop: () => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  selectedTool,
  onSelectTool,
  selectedSeed,
  onSelectSeed,
  inventory,
  onOpenShop,
}) => {
  const [showSeedPicker, setShowSeedPicker] = useState(false);

  const tools: Array<{ mode: ToolMode; label: string; icon: string; description: string }> = [
    { mode: 'inspect', label: 'Inspect', icon: '✋', description: 'Tap animals & buildings' },
    { mode: 'plow', label: 'Plow', icon: '⛏️', description: 'Till grass into soil' },
    { mode: 'carabao_plow', label: 'Kalabaw', icon: '🐃', description: 'Plow 3 fields at once with Water Buffalo' },
    { mode: 'plant', label: 'Plant', icon: '🌱', description: 'Sow seeds into soil' },
    { mode: 'water', label: 'Water', icon: '💧', description: 'Hydrate soil for 2x growth' },
    { mode: 'harvest', label: 'Harvest', icon: '🌾', description: 'Swipe to cut ripe crops' },
    { mode: 'move', label: 'Move', icon: '📦', description: 'Relocate farm items' },
  ];

  const handleToolClick = (tool: ToolMode) => {
    sound.playTap();
    onSelectTool(tool);
    if (tool === 'plant') {
      setShowSeedPicker(true);
    } else {
      setShowSeedPicker(false);
    }
  };

  const handleSeedSelect = (seed: CropType) => {
    sound.playTap();
    onSelectSeed(seed);
    setShowSeedPicker(false);
    onSelectTool('plant');
  };

  const cropKeys = Object.keys(CROPS) as CropType[];

  return (
    <div className="absolute bottom-3 left-0 right-0 z-30 flex flex-col items-center pointer-events-none px-3">
      {/* Seed Selection Drawer (visible when plant tool is active or opened) */}
      {(showSeedPicker || selectedTool === 'plant') && (
        <div className="pointer-events-auto mb-2 p-2 bg-slate-900/95 border border-emerald-500/30 rounded-2xl shadow-2xl flex items-center gap-2 overflow-x-auto max-w-[95vw] backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-2 text-[11px] font-semibold text-emerald-300 uppercase tracking-wider shrink-0">
            Seeds
          </div>
          {cropKeys.map((cropType) => {
            const crop = CROPS[cropType];
            const seedKey = `seed_${cropType}`;
            const count = inventory[seedKey] ?? 0;
            const isSelected = selectedSeed === cropType;

            return (
              <button
                key={cropType}
                onClick={() => handleSeedSelect(cropType)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl min-w-[58px] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md scale-105 border border-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60'
                }`}
              >
                <span className="text-xl leading-none mb-1">{crop.emoji}</span>
                <span className="text-[10px] font-bold truncate max-w-[50px] leading-tight">
                  {crop.name.split(' ')[1] || crop.name}
                </span>
                <span className="text-[9px] font-mono tabular-nums text-emerald-200 mt-0.5">
                  x{count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              sound.playTap();
              onOpenShop();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl min-w-[52px] bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-[10px] font-semibold shrink-0 cursor-pointer"
          >
            <span className="text-lg">➕</span>
            <span>Buy</span>
          </button>
        </div>
      )}

      {/* Main Bottom Thumb Bar */}
      <div className="pointer-events-auto flex items-center justify-center gap-1.5 p-1.5 bg-slate-950/90 border border-emerald-500/20 rounded-3xl shadow-2xl backdrop-blur-md max-w-lg w-full">
        {tools.map((tool) => {
          const isActive = selectedTool === tool.mode;

          return (
            <button
              key={tool.mode}
              onClick={() => handleToolClick(tool.mode)}
              title={tool.description}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-950/50 scale-105 border border-emerald-300/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 active:scale-95'
              }`}
            >
              <span className="text-lg sm:text-xl leading-none">{tool.icon}</span>
              <span className="text-[10px] font-semibold tracking-tight mt-1 truncate">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
