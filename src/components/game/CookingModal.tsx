import React, { useState, useEffect } from 'react';
import { CookingRecipe, GameState, ActiveBuff } from '../../types/game';
import { COOKING_RECIPES } from '../../constants/gameData';
import { sound } from '../../services/audio';

interface CookingModalProps {
  gameState: GameState;
  onClose: () => void;
  onCookRecipe: (recipe: CookingRecipe) => void;
  onEatDish: (recipe: CookingRecipe) => void;
}

export const CookingModal: React.FC<CookingModalProps> = ({
  gameState,
  onClose,
  onCookRecipe,
  onEatDish,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breakfast' | 'main' | 'dessert'>('all');
  const [cookingRecipe, setCookingRecipe] = useState<CookingRecipe | null>(null);
  const [cookProgress, setCookProgress] = useState(0);
  const [finishedDish, setFinishedDish] = useState<CookingRecipe | null>(null);
  const [stirClicks, setStirClicks] = useState(0);

  const filteredRecipes = COOKING_RECIPES.filter(
    (r) => selectedCategory === 'all' || r.category === selectedCategory
  );

  // Cooking timer loop
  useEffect(() => {
    if (!cookingRecipe) return;

    sound.playSizzle();
    const startTime = Date.now();
    const duration = cookingRecipe.cookTimeSec * 1000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setCookProgress(progress);

      if (progress >= 100) {
        clearInterval(timer);
        sound.playCookSuccess();
        setFinishedDish(cookingRecipe);
        onCookRecipe(cookingRecipe);
        setCookingRecipe(null);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [cookingRecipe, onCookRecipe]);

  const canCook = (recipe: CookingRecipe) => {
    return recipe.ingredients.every((ing) => (gameState.inventory[ing.itemKey] ?? 0) >= ing.count);
  };

  const handleStartCooking = (recipe: CookingRecipe) => {
    if (!canCook(recipe) || cookingRecipe) return;
    sound.playChop();
    setCookingRecipe(recipe);
    setCookProgress(0);
    setStirClicks(0);
    setFinishedDish(null);
  };

  const handleStir = () => {
    sound.playSizzle();
    sound.playChop();
    setStirClicks((prev) => prev + 1);
    setCookProgress((prev) => Math.min(99, prev + 18));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
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
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
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
          {/* Sizzling Simulation Screen if Cooking */}
          {cookingRecipe && (
            <div className="p-5 bg-gradient-to-b from-amber-950/60 to-slate-950/90 border border-amber-500/50 rounded-3xl shadow-xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              <div className="relative mb-3">
                <span className="text-5xl animate-bounce block">🍳</span>
                <span className="absolute -top-2 left-6 text-xl animate-pulse">♨️</span>
              </div>
              <h3 className="font-bold text-base text-amber-300">
                Sizzling {cookingRecipe.name}...
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {cookingRecipe.filipinoName} is simmering over fresh bamboo flame!
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-xs bg-slate-800 h-3 rounded-full mt-3 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 h-full rounded-full transition-all duration-150"
                  style={{ width: `${cookProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-amber-200 mt-1 tabular-nums">
                {cookProgress}% Prepared
              </span>

              {/* Interactive Stir button */}
              <button
                onClick={handleStir}
                className="mt-3 px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🥄</span>
                <span>Stir Fast! (+Speed)</span>
                {stirClicks > 0 && <span className="text-[10px] opacity-75">x{stirClicks}</span>}
              </button>
            </div>
          )}

          {/* Dish Ready Celebration Banner */}
          {finishedDish && !cookingRecipe && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl">
                  {finishedDish.icon}
                </div>
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm">
                    Dish Ready: {finishedDish.name}!
                  </h4>
                  <p className="text-xs text-slate-300">{finishedDish.buffDescription}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    sound.playHarvest();
                    onEatDish(finishedDish);
                    setFinishedDish(null);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🍽️</span>
                  <span>Feast & Apply Buff</span>
                </button>
                <button
                  onClick={() => setFinishedDish(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Keep in Pantry
                </button>
              </div>
            </div>
          )}

          {/* Recipes Catalog */}
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

                  {/* Cook Button */}
                  <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{recipe.cookTimeSec}s simmer</span>
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
