import React, { useState, useEffect, useRef } from 'react';
import { CookingRecipe, GameState, ActiveBuff } from '../../types/game';
import { COOKING_RECIPES } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface CookingModalProps {
  gameState: GameState;
  onClose: () => void;
  onCookRecipe: (recipe: CookingRecipe) => void;
  onEatDish: (recipe: CookingRecipe) => void;
}

// 4 seconds standard duration (comfortably within 3-5 seconds requested)
const COOK_DURATION_MS = 4000;

export const CookingModal: React.FC<CookingModalProps> = ({
  gameState,
  onClose,
  onCookRecipe,
  onEatDish,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breakfast' | 'main' | 'dessert'>('all');
  const [cookingRecipe, setCookingRecipe] = useState<CookingRecipe | null>(null);
  const [cookProgress, setCookProgress] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState(4.0);
  const [finishedDish, setFinishedDish] = useState<CookingRecipe | null>(null);
  const [stirCount, setStirCount] = useState(0);

  const startTimeRef = useRef<number>(0);
  const progressBoostRef = useRef<number>(0);

  const filteredRecipes = COOKING_RECIPES.filter(
    (r) => selectedCategory === 'all' || r.category === selectedCategory
  );

  // 3-5 second transition cooking simulation loop
  useEffect(() => {
    if (!cookingRecipe) return;

    sound.playChop();
    sound.playSizzle();
    startTimeRef.current = Date.now();
    progressBoostRef.current = 0;

    let sizzleTimer = 0;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) + progressBoostRef.current;
      const progress = Math.min(100, Math.round((elapsed / COOK_DURATION_MS) * 100));
      const remainingMs = Math.max(0, COOK_DURATION_MS - elapsed);

      setCookProgress(progress);
      setTimeLeftSec(Math.max(0, Number((remainingMs / 1000).toFixed(1))));

      // Periodic sizzle sound effect every 1.3 seconds
      sizzleTimer += 60;
      if (sizzleTimer >= 1300 && progress < 95) {
        sound.playSizzle();
        sizzleTimer = 0;
      }

      if (progress >= 100) {
        clearInterval(timer);
        sound.playCookSuccess();
        const done = cookingRecipe;
        setFinishedDish(done);
        onCookRecipe(done);
        setCookingRecipe(null);
      }
    }, 60);

    return () => clearInterval(timer);
  }, [cookingRecipe, onCookRecipe]);

  const canCook = (recipe: CookingRecipe) => {
    return recipe.ingredients.every((ing) => (gameState.inventory[ing.itemKey] ?? 0) >= ing.count);
  };

  const handleStartCooking = (recipe: CookingRecipe) => {
    if (!canCook(recipe) || cookingRecipe) return;
    setCookingRecipe(recipe);
    setCookProgress(0);
    setTimeLeftSec(4.0);
    setStirCount(0);
    setFinishedDish(null);
  };

  // Interactive Stir Kawali Button: speeds up cooking with sizzle/chop sounds
  const handleStir = () => {
    sound.playChop();
    sound.playSizzle();
    setStirCount((prev) => prev + 1);
    progressBoostRef.current += 600; // Adds 0.6s progress boost per vigorous stir!
  };

  // Cooking Stage descriptions based on current 3-5s progress
  const getCookingStageText = () => {
    if (cookProgress < 25) {
      return '🔪 Slicing & chopping farm-fresh ingredients...';
    } else if (cookProgress < 55) {
      return '🔥 Sizzling garlic, shallots & spices in hot clay kawali...';
    } else if (cookProgress < 85) {
      return '🍲 Simmering rich, savory broth over glowing coconut charcoal...';
    } else {
      return '✨ Garnishing and plating your fragrant farm feast...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-amber-500/20 rounded-2xl border border-amber-500/30">🍳</span>
            <div>
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                Naga Farm Cookhouse & Kusina
                <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
                  Recipe Simulator
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cook farm-fresh Filipino specialties with your harvests, fish & eggs
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Active Buff Banner */}
        {gameState.activeBuff && gameState.activeBuff.expiresAt > Date.now() && (
          <div className="mx-4 mt-3 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-950/80 to-emerald-950/80 border border-amber-500/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base animate-pulse">✨</span>
              <div>
                <span className="font-bold text-amber-300">Active Feast Buff: </span>
                <span className="text-slate-200">{gameState.activeBuff.label}</span>
              </div>
            </div>
            <span className="font-mono text-emerald-400 font-bold tabular-nums">
              {Math.max(0, Math.round((gameState.activeBuff.expiresAt - Date.now()) / 1000))}s left
            </span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto border-b border-slate-800 pb-2">
          {(['all', 'breakfast', 'main', 'dessert'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playTap();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Dishes' : cat}
            </button>
          ))}
        </div>

        {/* Main Cooking Station & Recipe List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 3-5 SECOND INTERACTIVE COOKING TRANSITION SCREEN */}
          {cookingRecipe && (
            <div className="p-6 bg-gradient-to-b from-amber-950/80 via-slate-950 to-slate-950 border-2 border-amber-500/60 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
              {/* Subtle Ember Glow Background Effect */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

              {/* Cooking Pot / Kawali Centerpiece Animation */}
              <div className="relative my-2">
                {/* Rising Steam Wisps */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-2">
                  <span className="text-xl animate-bounce text-slate-200/80">♨️</span>
                  <span className="text-2xl animate-pulse text-amber-200/90 -mt-2">♨️</span>
                  <span className="text-xl animate-bounce text-slate-200/80">♨️</span>
                </div>

                {/* Sizzling Kawali / Wok */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-slate-800 to-amber-950 border-4 border-amber-600/80 shadow-2xl flex items-center justify-center relative shadow-amber-500/20">
                  <span className="text-4xl animate-bounce">{cookingRecipe.icon}</span>

                  {/* Flame base */}
                  <div className="absolute -bottom-2 flex gap-1 items-center">
                    <span className="text-lg animate-pulse">🔥</span>
                    <span className="text-base animate-bounce">🔥</span>
                    <span className="text-lg animate-pulse">🔥</span>
                  </div>
                </div>
              </div>

              {/* Dish Titles & Simmer Countdown */}
              <div className="mt-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-bold inline-block mb-1">
                  ⏱️ {timeLeftSec}s Cooking Transition
                </span>
                <h3 className="font-bold text-lg text-white">
                  Cooking {cookingRecipe.name}
                </h3>
                <p className="text-xs text-amber-300 font-medium">
                  {cookingRecipe.filipinoName}
                </p>
              </div>

              {/* Live Stage Status Message */}
              <div className="mt-3 px-3 py-1.5 bg-slate-900/90 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-medium animate-pulse">
                {getCookingStageText()}
              </div>

              {/* 3-5s Transition Progress Bar */}
              <div className="w-full max-w-sm bg-slate-800 h-3.5 rounded-full mt-3 overflow-hidden border border-slate-700 shadow-inner p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 h-full rounded-full transition-all duration-100 shadow-lg shadow-amber-500/50"
                  style={{ width: `${cookProgress}%` }}
                />
              </div>

              <div className="w-full max-w-sm flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1 px-1">
                <span>{cookProgress}% Prepared</span>
                <span className="text-amber-300 font-bold">{timeLeftSec}s remaining</span>
              </div>

              {/* Active Ingredients Simmering in the Wok */}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300">
                <span className="text-[10px] uppercase font-bold text-slate-400">In the Pan:</span>
                {cookingRecipe.ingredients.map((ing) => (
                  <span
                    key={ing.itemKey}
                    className="px-2 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700 text-[11px] flex items-center gap-1"
                  >
                    <span>{ing.icon}</span>
                    <span>{ing.itemName}</span>
                  </span>
                ))}
              </div>

              {/* Interactive Stir Kawali Button: Allows tapping to participate and speed up cooking */}
              <button
                onClick={handleStir}
                className="mt-4 px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold rounded-2xl text-xs shadow-lg border border-amber-300 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="text-base">🥄</span>
                <span>Stir Kawali! (+Speed)</span>
                {stirCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-950/40 text-amber-200 text-[10px] font-mono">
                    x{stirCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Dish Ready Celebration Presentation */}
          {finishedDish && !cookingRecipe && (
            <div className="p-4 bg-emerald-950/70 border-2 border-emerald-500/60 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  {finishedDish.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base">
                      {finishedDish.name} Ready!
                    </h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-900/80 text-emerald-300 rounded border border-emerald-500/30">
                      🪙 {finishedDish.sellValue}
                    </span>
                  </div>
                  <p className="text-xs text-amber-300 font-medium">{finishedDish.filipinoName}</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">{finishedDish.buffDescription}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => {
                    sound.playHarvest();
                    onEatDish(finishedDish);
                    setFinishedDish(null);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🍽️</span>
                  <span>Feast & Apply Buff</span>
                </button>
                <button
                  onClick={() => setFinishedDish(null)}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Keep in Pantry
                </button>
              </div>
            </div>
          )}

          {/* Recipes Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRecipes.map((recipe) => {
              const affordable = canCook(recipe);
              const cookedCount = gameState.cookedDishes[recipe.id] ?? 0;

              return (
                <div
                  key={recipe.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    affordable
                      ? 'bg-slate-800/70 border-slate-700/60 hover:border-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800/80 opacity-80'
                  }`}
                >
                  <div>
                    {/* Title & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 bg-slate-700/50 rounded-xl border border-slate-600/40">
                          {recipe.icon}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-white">{recipe.name}</h4>
                          <span className="text-[11px] text-amber-300 font-medium block">
                            {recipe.filipinoName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-emerald-400 block">
                          🪙 {recipe.sellValue}
                        </span>
                        {cookedCount > 0 && (
                          <span className="text-[10px] font-mono text-slate-400">
                            Cooked: x{cookedCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      {recipe.description}
                    </p>

                    {/* Buff Tag */}
                    <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-200 flex items-center gap-1.5">
                      <span>✨</span>
                      <span className="truncate">{recipe.buffDescription}</span>
                    </div>

                    {/* Ingredients Required */}
                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Ingredients Needed
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.ingredients.map((ing) => {
                          const owned = gameState.inventory[ing.itemKey] ?? 0;
                          const hasEnough = owned >= ing.count;

                          return (
                            <div
                              key={ing.itemKey}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono flex items-center gap-1 border ${
                                hasEnough
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                                  : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              <span>{ing.icon}</span>
                              <span>{ing.itemName}:</span>
                              <span className="font-bold">
                                {owned}/{ing.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Cook Button & Duration Indicator */}
                  <div className="mt-3 pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <span>⏱️</span>
                      <span>3-5s simmer</span>
                    </span>

                    <button
                      onClick={() => handleStartCooking(recipe)}
                      disabled={!affordable || !!cookingRecipe}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        affordable && !cookingRecipe
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <span>🍳</span>
                      <span>Cook Dish</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
