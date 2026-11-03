import React from 'react';
import { GameState, WeatherType } from '../../types/game';
import { SEASONS_INFO } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface HUDProps {
  gameState: GameState;
  onOpenShop: () => void;
  onOpenOrders: () => void;
  onOpenTasks: () => void;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
  onOpenHouseCustomizer: () => void;
  onOpenAutomation: () => void;
  onOpenCooking: () => void;
  onOpenLandExpansion: () => void;
  onOpenLevelRoadmap: () => void;
  onAdvanceDay: () => void;
  onToggleTimeOfDay: () => void;
  onCycleWeather: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  onOpenShop,
  onOpenOrders,
  onOpenTasks,
  onOpenInventory,
  onOpenSettings,
  onOpenHouseCustomizer,
  onOpenAutomation,
  onOpenCooking,
  onOpenLandExpansion,
  onOpenLevelRoadmap,
  onAdvanceDay,
  onToggleTimeOfDay,
  onCycleWeather,
}) => {
  const xpNeeded = gameState.level * 100;
  const xpPercent = Math.min(100, Math.round((gameState.xp / xpNeeded) * 100));

  const pendingOrdersCount = gameState.orders.filter((o) => !o.completed).length;
  const uncompletedTasksCount = gameState.tasks.filter((t) => !t.claimed).length;

  const soilCount = gameState.tiles.filter((t) => t.type === 'soil' || Boolean(t.crop)).length;
  const maxFields = gameState.level * 3;

  const isKusinaUnlocked = gameState.level >= 10;
  const isAutoTechUnlocked = gameState.level >= 5;

  const weatherIcons: Record<WeatherType, { icon: string; name: string }> = {
    sunny: { icon: '☀️', name: 'Sunny' },
    rain: { icon: '🌧️', name: 'Rain' },
    thunderstorm: { icon: '⛈️', name: 'Storm' },
    snow: { icon: '❄️', name: 'Snow' },
    petal_breeze: { icon: '🌸', name: 'Petals' },
    autumn_wind: { icon: '🍂', name: 'Wind' },
  };

  const currentWeather = weatherIcons[gameState.weather || 'sunny'];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-4">
      {/* Top Perimeter Status Cluster */}
      <div className="w-full flex items-start justify-between gap-2">
        {/* Left: Farm Identity, Level XP, & Stacked Field Limit */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/85 text-white rounded-2xl p-1.5 pr-4 border border-emerald-500/20 shadow-md">
          <button
            onClick={() => {
              sound.playTap();
              onOpenLevelRoadmap();
            }}
            title="Click to view Level Unlocks & Guide"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 flex flex-col items-center justify-center font-bold text-slate-950 text-sm shadow-inner shrink-0 cursor-pointer active:scale-95 transition-all group"
          >
            <span className="leading-none text-base font-extrabold">{gameState.level}</span>
            <span className="text-[8px] uppercase tracking-tighter opacity-80 leading-none">LVL</span>
          </button>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-100 truncate max-w-[110px] sm:max-w-[150px]">
                {gameState.farmName}
              </span>
              {/* Stacked Field Limit Pill */}
              <span
                title={`Plowed fields: ${soilCount} / ${maxFields} max (${gameState.level} × 3 stacked)`}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30"
              >
                🌱 {soilCount}/{maxFields}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-16 sm:w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums text-emerald-300">
                {gameState.xp}/{xpNeeded}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Season, Day, Weather & Time of Day */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/85 text-slate-200 rounded-2xl px-3 py-1.5 border border-emerald-500/20 shadow-md text-xs">
          <button
            onClick={() => {
              sound.playTap();
              onAdvanceDay();
            }}
            title="Advance Day / Season"
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span className="text-sm">
              {gameState.season === 'spring' ? '🌸' : gameState.season === 'summer' ? '🌻' : gameState.season === 'autumn' ? '🍁' : '❄️'}
            </span>
            <div className="flex flex-col text-left">
              <span className="font-semibold capitalize text-white leading-tight">
                {gameState.season} Day {gameState.seasonDay}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight hidden sm:inline">
                Tap to advance
              </span>
            </div>
          </button>

          <div className="h-5 w-[1px] bg-slate-700 mx-1" />

          {/* Weather Toggle */}
          <button
            onClick={() => {
              sound.playTap();
              onCycleWeather();
            }}
            title={`Weather: ${currentWeather.name} (Tap to change)`}
            className="flex items-center gap-1 px-1.5 py-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-sm">{currentWeather.icon}</span>
            <span className="text-[10px] text-slate-300 font-medium hidden md:inline">
              {currentWeather.name}
            </span>
          </button>

          <div className="h-5 w-[1px] bg-slate-700 mx-1" />

          {/* Time of Day Toggle */}
          <button
            onClick={() => {
              sound.playTap();
              onToggleTimeOfDay();
            }}
            title={`Time: ${gameState.timeOfDay} (tap to change)`}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {gameState.timeOfDay === 'morning' ? '🌅' : gameState.timeOfDay === 'day' ? '☀️' : gameState.timeOfDay === 'sunset' ? '🌇' : '🌙'}
          </button>
        </div>

        {/* Right: Currency & Settings */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-500/30 rounded-2xl px-3 py-1.5 shadow-md">
            <span className="text-sm">🪙</span>
            <span className="font-mono font-bold tabular-nums text-xs sm:text-sm text-amber-300">
              {gameState.coins}
            </span>
          </div>

          {/* Ribbons / Gems */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-rose-500/30 rounded-2xl px-3 py-1.5 shadow-md">
            <span className="text-sm">🎀</span>
            <span className="font-mono font-bold tabular-nums text-xs sm:text-sm text-rose-300">
              {gameState.gems}
            </span>
          </div>

          {/* Settings button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenSettings();
            }}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 rounded-2xl shadow-md transition-colors cursor-pointer"
            title="Settings & Menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Side Quick Actions on right thumb side */}
      <div className="pointer-events-none self-end flex flex-col gap-2 mb-20 sm:mb-24">
        {/* Level Roadmap & Unlock Guide Button */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenLevelRoadmap();
          }}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg border border-amber-300/50 active:scale-95 transition-all cursor-pointer"
          title="View Level Unlock Guide & Roadmap"
        >
          <span className="text-base">🏆</span>
          <span className="hidden sm:inline">Guide</span>
          <span className="text-[10px] uppercase font-mono px-1 rounded bg-black/30 text-amber-200">
            Lv {gameState.level}
          </span>
        </button>

        {/* Cooking Kusina Simulator Button (Unlocked at Level 10) */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenCooking();
          }}
          className={`pointer-events-auto flex items-center gap-2 px-3 py-2 font-bold text-xs rounded-2xl shadow-lg border active:scale-95 transition-all cursor-pointer ${
            isKusinaUnlocked
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-orange-300/40 shadow-orange-500/20'
              : 'bg-slate-900/90 text-slate-400 border-slate-700/60 hover:text-slate-200'
          }`}
          title={isKusinaUnlocked ? 'Cook delicious recipes in Kusina' : 'Kusina unlocks at Farm Level 10!'}
        >
          <span className="text-base">{isKusinaUnlocked ? '🍳' : '🔒'}</span>
          <span className="hidden sm:inline">{isKusinaUnlocked ? 'Kusina' : 'Kusina (Lv 10)'}</span>
        </button>

        {/* Land Expansion Button */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenLandExpansion();
          }}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-2xl shadow-lg border border-emerald-400/40 active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-base">🏞️</span>
          <span className="hidden sm:inline">Expand</span>
        </button>

        {/* House Architecture & Furniture Customizer Button (3D Interior) */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenHouseCustomizer();
          }}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg border border-teal-300/40 active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-base">🏡</span>
          <span className="hidden sm:inline">Homestead</span>
        </button>

        {/* Automation Hub Button (Unlocked at Level 5) */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenAutomation();
          }}
          className={`pointer-events-auto relative flex items-center gap-2 px-3 py-2 font-bold text-xs rounded-2xl shadow-lg border active:scale-95 transition-all cursor-pointer ${
            isAutoTechUnlocked
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 border-amber-300/40'
              : 'bg-slate-900/90 text-slate-400 border-slate-700/60 hover:text-slate-200'
          }`}
          title={isAutoTechUnlocked ? 'Configure automated machinery' : 'Auto Tech unlocks at Farm Level 5!'}
        >
          <span className="text-base">{isAutoTechUnlocked ? '⚙️' : '🔒'}</span>
          <span className="hidden sm:inline">{isAutoTechUnlocked ? 'Auto Tech' : 'Auto Tech (Lv 5)'}</span>
          {isAutoTechUnlocked && (gameState.automation?.autoHarvestEnabled || gameState.automation?.autoPlantEnabled || gameState.automation?.autoFeedEnabled) && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          )}
        </button>

        {/* Shop Button */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenShop();
          }}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg border border-amber-300/40 active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-base">🏪</span>
          <span className="hidden sm:inline">Farm Shop</span>
        </button>

        {/* Orders Board */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenOrders();
          }}
          className="pointer-events-auto relative flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-semibold text-xs rounded-2xl shadow-lg border border-sky-500/30 active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-base">📋</span>
          <span className="hidden sm:inline">Orders</span>
          {pendingOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center border border-slate-950">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Seasonal Tasks */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenTasks();
          }}
          className="pointer-events-auto relative flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-semibold text-xs rounded-2xl shadow-lg border border-emerald-500/30 active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-base">🌻</span>
          <span className="hidden sm:inline">Seasons</span>
          {uncompletedTasksCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center border border-slate-950">
              {uncompletedTasksCount}
            </span>
          )}
        </button>

        {/* Storage Silo / Inventory */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenInventory();
          }}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-semibold text-xs rounded-2xl shadow-lg border border-purple-500/30 active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-base">📦</span>
          <span className="hidden sm:inline">Storage</span>
        </button>
      </div>
    </div>
  );
};
