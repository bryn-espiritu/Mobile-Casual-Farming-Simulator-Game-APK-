/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, ToolMode, CropType, FarmTile, SeasonalTask, TownOrder, Season, TimeOfDay } from './types/game';
import { CROPS, getInitialOrders, getInitialTasks, GRID_SIZE } from './constants/gameData';
import { loadSavedGameState, saveGameState, getDefaultGameState, clearSavedGameState } from './services/storage';
import { sound } from './services/audio';
import { TitleScreen } from './components/game/TitleScreen';
import { IsometricCanvas } from './components/game/IsometricCanvas';
import { HUD } from './components/game/HUD';
import { ToolBar } from './components/game/ToolBar';
import { ShopModal } from './components/game/ShopModal';
import { OrderBoardModal } from './components/game/OrderBoardModal';
import { SeasonalTasksModal } from './components/game/SeasonalTasksModal';
import { InventoryModal } from './components/game/InventoryModal';
import { SettingsModal } from './components/game/SettingsModal';
import { PWAInstallModal } from './components/game/PWAInstallModal';

export default function App() {
  const [screen, setScreen] = useState<'TITLE' | 'PLAYING'>('TITLE');
  const [gameState, setGameState] = useState<GameState>(() => loadSavedGameState());

  // Modal Dialogs
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Relocating / Moving item state
  const [movingTile, setMovingTile] = useState<FarmTile | null>(null);

  // Sync audio mute states
  useEffect(() => {
    sound.sfxMuted = gameState.sfxMuted;
    sound.ambientMuted = gameState.ambientMuted;
  }, [gameState.sfxMuted, gameState.ambientMuted]);

  // Start background ambient music when playing
  useEffect(() => {
    if (screen === 'PLAYING') {
      sound.startAmbient();
    } else {
      sound.stopAmbient();
    }
  }, [screen]);

  // Periodic Auto-Save
  useEffect(() => {
    const timer = setInterval(() => {
      saveGameState(gameState);
    }, 5000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Simulation Tick (Crop Growth, Animal wanders, Produce readiness)
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        let changed = false;
        const now = Date.now();

        const newTiles = prev.tiles.map((tile) => {
          // 1. Crop Growth Tick
          if (tile.crop && !tile.crop.isReady) {
            const cropDef = CROPS[tile.crop.type];
            if (cropDef) {
              const elapsedSec = (now - tile.crop.plantedAt) / 1000;
              // Watered crops grow 1.8x faster
              const speedMultiplier = tile.crop.watered ? 1.8 : 1.0;
              const progress = Math.min(1.0, (elapsedSec * speedMultiplier) / cropDef.growthTimeSec);

              if (progress !== tile.crop.growthProgress) {
                changed = true;
                return {
                  ...tile,
                  crop: {
                    ...tile.crop,
                    growthProgress: progress,
                    isReady: progress >= 1.0,
                  },
                };
              }
            }
          }

          // 2. Animal Subtle Wander & Produce Tick
          if (tile.animal) {
            // Animals wander slightly within +/- 5px
            const wanderX = Math.sin(now / 1500 + tile.x) * 4;
            const wanderY = Math.cos(now / 1800 + tile.y) * 3;

            // Generate produce every ~45 seconds if not ready
            const shouldProduce = !tile.animal.produceReady && now - tile.animal.lastPet > 45000;

            if (tile.animal.offsetX !== wanderX || tile.animal.offsetY !== wanderY || shouldProduce) {
              changed = true;
              return {
                ...tile,
                animal: {
                  ...tile.animal,
                  offsetX: wanderX,
                  offsetY: wanderY,
                  produceReady: tile.animal.produceReady || shouldProduce,
                },
              };
            }
          }

          return tile;
        });

        if (!changed) return prev;
        return { ...prev, tiles: newTiles };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen]);

  // Helper to increment seasonal task progress
  const updateTaskProgress = useCallback((actionType: 'plant' | 'water' | 'harvest' | 'pet' | 'order', count: number = 1) => {
    setGameState((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.completed || task.claimed) return task;

        let shouldAdvance = false;
        if (actionType === 'plant' && task.title.toLowerCase().includes('sow') || task.title.toLowerCase().includes('plant')) {
          shouldAdvance = true;
        } else if (actionType === 'water' && (task.title.toLowerCase().includes('dew') || task.title.toLowerCase().includes('water') || task.description.toLowerCase().includes('water'))) {
          shouldAdvance = true;
        } else if (actionType === 'harvest' && (task.title.toLowerCase().includes('harvest') || task.title.toLowerCase().includes('basket') || task.title.toLowerCase().includes('field') || task.title.toLowerCase().includes('berries'))) {
          shouldAdvance = true;
        } else if (actionType === 'pet' && (task.title.toLowerCase().includes('companion') || task.title.toLowerCase().includes('animal') || task.title.toLowerCase().includes('care'))) {
          shouldAdvance = true;
        } else if (actionType === 'order' && (task.title.toLowerCase().includes('granary') || task.title.toLowerCase().includes('order'))) {
          shouldAdvance = true;
        }

        if (shouldAdvance) {
          const newCount = Math.min(task.targetCount, task.currentCount + count);
          return {
            ...task,
            currentCount: newCount,
            completed: newCount >= task.targetCount,
          };
        }
        return task;
      });

      return { ...prev, tasks: updatedTasks };
    });
  }, []);

  // Check and grant XP / Level Up
  const addXP = useCallback((amount: number) => {
    setGameState((prev) => {
      let currentXP = prev.xp + amount;
      let currentLevel = prev.level;
      let needed = currentLevel * 100;
      let didLevelUp = false;

      while (currentXP >= needed) {
        currentXP -= needed;
        currentLevel += 1;
        needed = currentLevel * 100;
        didLevelUp = true;
      }

      if (didLevelUp) {
        sound.playLevelUp();
      }

      return {
        ...prev,
        xp: currentXP,
        level: currentLevel,
      };
    });
  }, []);

  // Tool Action on Tile
  const handleTileAction = useCallback((tile: FarmTile, tool: ToolMode) => {
    const { x, y } = tile;

    if (tool === 'plow') {
      if (tile.type === 'grass') {
        setGameState((prev) => ({
          ...prev,
          tiles: prev.tiles.map((t) => (t.x === x && t.y === y ? { ...t, type: 'soil' } : t)),
        }));
      }
    } else if (tool === 'plant') {
      if (tile.type === 'soil' && !tile.crop) {
        const seedKey = `seed_${gameState.selectedSeed}`;
        const seedCount = gameState.inventory[seedKey] ?? 0;

        if (seedCount > 0) {
          setGameState((prev) => ({
            ...prev,
            inventory: {
              ...prev.inventory,
              [seedKey]: seedCount - 1,
            },
            tiles: prev.tiles.map((t) =>
              t.x === x && t.y === y
                ? {
                    ...t,
                    crop: {
                      type: prev.selectedSeed,
                      plantedAt: Date.now(),
                      watered: false,
                      growthProgress: 0,
                      isReady: false,
                    },
                  }
                : t
            ),
          }));
          updateTaskProgress('plant', 1);
        } else {
          // Open shop to buy seeds
          setIsShopOpen(true);
        }
      }
    } else if (tool === 'water') {
      if (tile.type === 'soil' && tile.crop && !tile.crop.watered) {
        setGameState((prev) => ({
          ...prev,
          tiles: prev.tiles.map((t) =>
            t.x === x && t.y === y && t.crop ? { ...t, crop: { ...t.crop, watered: true } } : t
          ),
        }));
        updateTaskProgress('water', 1);
      }
    } else if (tool === 'harvest') {
      if (tile.crop && tile.crop.isReady) {
        const cropType = tile.crop.type;
        const cropDef = CROPS[cropType];

        setGameState((prev) => {
          const currentCount = prev.inventory[cropType] ?? 0;
          return {
            ...prev,
            coins: prev.coins + cropDef.sellPrice,
            totalCoinsEarned: prev.totalCoinsEarned + cropDef.sellPrice,
            totalCropsHarvested: prev.totalCropsHarvested + 1,
            inventory: {
              ...prev.inventory,
              [cropType]: currentCount + 1,
            },
            tiles: prev.tiles.map((t) => (t.x === x && t.y === y ? { ...t, crop: undefined } : t)),
          };
        });

        addXP(cropDef.xpYield);
        updateTaskProgress('harvest', 1);
      }
    } else if (tool === 'move') {
      // Pick up tile for relocating
      setMovingTile(tile);
    } else if (tool === 'shovel') {
      // Clear soil or path back to grass
      if (tile.type !== 'grass' && !tile.structure && !tile.animal) {
        setGameState((prev) => ({
          ...prev,
          tiles: prev.tiles.map((t) => (t.x === x && t.y === y ? { ...t, type: 'grass', crop: undefined } : t)),
        }));
      }
    }
  }, [addXP, gameState.inventory, gameState.selectedSeed, updateTaskProgress]);

  // Animal Petting / Collecting Produce
  const handleAnimalPet = useCallback((animalId: string, tile: FarmTile) => {
    setGameState((prev) => {
      let collectedProduce = '';
      let rewardCoins = 10;
      let rewardXP = 15;

      const newTiles = prev.tiles.map((t) => {
        if (t.animal && t.animal.id === animalId) {
          const produceReady = t.animal.produceReady;
          if (produceReady) {
            collectedProduce = t.animal.type === 'cow' ? 'milk' : t.animal.type === 'chicken' ? 'egg' : t.animal.type === 'sheep' ? 'wool' : 'love';
            rewardCoins = 35;
            rewardXP = 25;
          }
          return {
            ...t,
            animal: {
              ...t.animal,
              petCount: t.animal.petCount + 1,
              lastPet: Date.now(),
              produceReady: false,
            },
          };
        }
        return t;
      });

      const newInventory = { ...prev.inventory };
      if (collectedProduce && collectedProduce !== 'love') {
        newInventory[collectedProduce] = (newInventory[collectedProduce] ?? 0) + 1;
      }

      return {
        ...prev,
        coins: prev.coins + rewardCoins,
        totalCoinsEarned: prev.totalCoinsEarned + rewardCoins,
        totalAnimalsPetted: prev.totalAnimalsPetted + 1,
        inventory: newInventory,
        tiles: newTiles,
      };
    });

    addXP(15);
    updateTaskProgress('pet', 1);
  }, [addXP, updateTaskProgress]);

  // Structure interaction
  const handleStructureClick = useCallback((structureType: string, tile: FarmTile) => {
    if (structureType === 'farmhouse') {
      setIsShopOpen(true);
    } else if (structureType === 'barn' || structureType === 'coop') {
      setIsInventoryOpen(true);
    } else if (structureType === 'well') {
      // Hydrate all adjacent crops!
      sound.playWater();
      setGameState((prev) => {
        const adjacent = prev.tiles.map((t) => {
          if (Math.abs(t.x - tile.x) <= 2 && Math.abs(t.y - tile.y) <= 2 && t.crop && !t.crop.watered) {
            return { ...t, crop: { ...t.crop, watered: true } };
          }
          return t;
        });
        return { ...prev, tiles: adjacent };
      });
      updateTaskProgress('water', 3);
    } else if (structureType === 'windmill') {
      // Grind wheat bonus
      sound.playHarvest();
      setGameState((prev) => {
        const wheatCount = prev.inventory['wheat'] ?? 0;
        if (wheatCount > 0) {
          return {
            ...prev,
            coins: prev.coins + 50,
            inventory: { ...prev.inventory, wheat: wheatCount - 1 },
          };
        }
        return { ...prev, coins: prev.coins + 15 };
      });
    } else if (structureType === 'beehive') {
      sound.playCoin();
      setGameState((prev) => ({
        ...prev,
        coins: prev.coins + 40,
      }));
    }
  }, [updateTaskProgress]);

  // Relocating Item Placement
  const handlePlaceMovedTile = useCallback((targetX: number, targetY: number) => {
    if (!movingTile) return;

    sound.playTap();
    setGameState((prev) => {
      const sourceTile = prev.tiles.find((t) => t.x === movingTile.x && t.y === movingTile.y);
      const targetTile = prev.tiles.find((t) => t.x === targetX && t.y === targetY);
      if (!sourceTile || !targetTile) return prev;

      const newTiles = prev.tiles.map((t) => {
        if (t.x === sourceTile.x && t.y === sourceTile.y) {
          return {
            ...t,
            structure: targetTile.structure,
            animal: targetTile.animal,
            decor: targetTile.decor,
            type: targetTile.type === 'grass' ? 'grass' : t.type,
          };
        }
        if (t.x === targetTile.x && t.y === targetTile.y) {
          return {
            ...t,
            structure: sourceTile.structure,
            animal: sourceTile.animal,
            decor: sourceTile.decor,
            type: sourceTile.type !== 'grass' && sourceTile.type !== 'soil' ? sourceTile.type : t.type,
          };
        }
        return t;
      });

      return { ...prev, tiles: newTiles };
    });

    setMovingTile(null);
  }, [movingTile]);

  // Town Order Fulfillment
  const handleFulfillOrder = useCallback((order: TownOrder) => {
    setGameState((prev) => {
      const newInventory = { ...prev.inventory };
      order.requirements.forEach((req) => {
        newInventory[req.itemKey] = Math.max(0, (newInventory[req.itemKey] ?? 0) - req.count);
      });

      const updatedOrders = prev.orders.map((o) => (o.id === order.id ? { ...o, completed: true } : o));

      return {
        ...prev,
        coins: prev.coins + order.rewardCoins,
        gems: prev.gems + order.rewardHearts,
        totalCoinsEarned: prev.totalCoinsEarned + order.rewardCoins,
        inventory: newInventory,
        orders: updatedOrders,
      };
    });

    addXP(order.rewardXP);
    updateTaskProgress('order', 1);

    // Replenish new order after 4 seconds
    setTimeout(() => {
      setGameState((prev) => {
        const activeCount = prev.orders.filter((o) => !o.completed).length;
        if (activeCount < 4) {
          const fresh = getInitialOrders().map((o) => ({ ...o, id: 'ord_' + Math.random().toString(36).slice(2, 7) }));
          const nextOrder = fresh[Math.floor(Math.random() * fresh.length)];
          return {
            ...prev,
            orders: [...prev.orders.filter((o) => !o.completed), nextOrder],
          };
        }
        return prev;
      });
    }, 4000);
  }, [addXP, updateTaskProgress]);

  // Claiming Seasonal Task
  const handleClaimTask = useCallback((task: SeasonalTask) => {
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + task.rewardCoins,
      gems: prev.gems + task.rewardGems,
      totalCoinsEarned: prev.totalCoinsEarned + task.rewardCoins,
      tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, claimed: true } : t)),
    }));
    addXP(task.rewardXP);
  }, [addXP]);

  // Advance Season
  const handleAdvanceSeason = useCallback(() => {
    const seasonsOrder: Season[] = ['spring', 'summer', 'autumn', 'winter'];
    setGameState((prev) => {
      const currentIndex = seasonsOrder.indexOf(prev.season);
      const nextSeason = seasonsOrder[(currentIndex + 1) % seasonsOrder.length];
      return {
        ...prev,
        season: nextSeason,
        seasonDay: 1,
        totalDays: prev.totalDays + 1,
        tasks: getInitialTasks(nextSeason),
      };
    });
  }, []);

  // Advance Day
  const handleAdvanceDay = useCallback(() => {
    setGameState((prev) => {
      const nextDay = prev.seasonDay + 1;
      if (nextDay > 7) {
        // Roll into next season
        const seasonsOrder: Season[] = ['spring', 'summer', 'autumn', 'winter'];
        const currentIndex = seasonsOrder.indexOf(prev.season);
        const nextSeason = seasonsOrder[(currentIndex + 1) % seasonsOrder.length];
        sound.playSeasonChange();
        return {
          ...prev,
          season: nextSeason,
          seasonDay: 1,
          totalDays: prev.totalDays + 1,
          tasks: getInitialTasks(nextSeason),
        };
      }
      return {
        ...prev,
        seasonDay: nextDay,
        totalDays: prev.totalDays + 1,
      };
    });
  }, []);

  // Toggle Time of Day (Morning -> Day -> Sunset -> Night)
  const handleToggleTimeOfDay = useCallback(() => {
    const times: TimeOfDay[] = ['morning', 'day', 'sunset', 'night'];
    setGameState((prev) => {
      const nextIdx = (times.indexOf(prev.timeOfDay) + 1) % times.length;
      return { ...prev, timeOfDay: times[nextIdx] };
    });
  }, []);

  // Buying Seeds
  const handleBuySeed = useCallback((cropType: CropType, cost: number) => {
    setGameState((prev) => {
      if (prev.coins < cost) return prev;
      const seedKey = `seed_${cropType}`;
      return {
        ...prev,
        coins: prev.coins - cost,
        inventory: {
          ...prev.inventory,
          [seedKey]: (prev.inventory[seedKey] ?? 0) + 1,
        },
      };
    });
  }, []);

  // Buying Items / Livestock / Decor
  const handleBuyItem = useCallback((itemId: string, itemName: string, cost: number, category: string) => {
    setGameState((prev) => {
      if (prev.coins < cost) return prev;

      // Find first empty grass tile to place animal or decor
      let placed = false;
      const newTiles = prev.tiles.map((tile) => {
        if (!placed && tile.type === 'grass' && !tile.crop && !tile.structure && !tile.animal && !tile.decor) {
          placed = true;
          if (category === 'animal') {
            const anType = itemId.replace('animal_', '') as any;
            return {
              ...tile,
              animal: {
                id: `${anType}_${Date.now()}`,
                type: anType,
                name: itemName,
                petCount: 0,
                lastPet: Date.now(),
                produceReady: true,
                offsetX: 0,
                offsetY: 0,
                wanderTargetX: 0,
                wanderTargetY: 0,
              },
            };
          } else if (category === 'decor') {
            if (itemId === 'stone_path' || itemId === 'wood_path' || itemId === 'flower_bed' || itemId === 'fence' || itemId === 'water_pond') {
              return { ...tile, type: itemId as any };
            } else {
              return { ...tile, decor: { id: `decor_${Date.now()}`, type: itemId.replace('tree_', '') as any } };
            }
          }
        }
        return tile;
      });

      return {
        ...prev,
        coins: prev.coins - cost,
        tiles: newTiles,
      };
    });
  }, []);

  // Selling Storage Items
  const handleSellItem = useCallback((itemKey: string, count: number, pricePerUnit: number) => {
    setGameState((prev) => {
      const owned = prev.inventory[itemKey] ?? 0;
      if (owned < count) return prev;

      const revenue = count * pricePerUnit;
      return {
        ...prev,
        coins: prev.coins + revenue,
        totalCoinsEarned: prev.totalCoinsEarned + revenue,
        inventory: {
          ...prev.inventory,
          [itemKey]: owned - count,
        },
      };
    });
  }, []);

  // Reset Farm
  const handleResetFarm = useCallback(() => {
    clearSavedGameState();
    setGameState(getDefaultGameState());
    setIsSettingsOpen(false);
  }, []);

  // Mobile Frame Wrapper Container
  const renderGameContent = () => {
    if (screen === 'TITLE') {
      return (
        <TitleScreen
          gameState={gameState}
          onStartGame={() => setScreen('PLAYING')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden select-none">
        {/* 60fps Isometric Canvas */}
        <IsometricCanvas
          gameState={gameState}
          onTileAction={handleTileAction}
          onAnimalPet={handleAnimalPet}
          onStructureClick={handleStructureClick}
          movingTile={movingTile}
          onPlaceMovedTile={handlePlaceMovedTile}
          onCancelMove={() => setMovingTile(null)}
        />

        {/* Low-Occlusion HUD */}
        <HUD
          gameState={gameState}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenOrders={() => setIsOrdersOpen(true)}
          onOpenTasks={() => setIsTasksOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onAdvanceDay={handleAdvanceDay}
          onToggleTimeOfDay={handleToggleTimeOfDay}
        />

        {/* Bottom Thumb Toolbar */}
        <ToolBar
          selectedTool={gameState.selectedTool}
          onSelectTool={(tool) => setGameState((prev) => ({ ...prev, selectedTool: tool }))}
          selectedSeed={gameState.selectedSeed}
          onSelectSeed={(seed) => setGameState((prev) => ({ ...prev, selectedSeed: seed }))}
          inventory={gameState.inventory}
          onOpenShop={() => setIsShopOpen(true)}
        />
      </div>
    );
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0c140f] flex items-center justify-center">
      {/* If Mobile Frame Mode is enabled on desktop viewports, render realistic smartphone bezel */}
      {gameState.mobileFrameMode ? (
        <div className="relative w-full max-w-[430px] h-full max-h-[890px] rounded-[44px] overflow-hidden shadow-2xl border-[8px] border-slate-900 bg-black flex flex-col">
          {/* Smartphone Speaker & Camera Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 w-32 h-6 bg-slate-900 rounded-b-2xl flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-800 rounded-full" />
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-3 border border-slate-800" />
          </div>

          <div className="flex-1 w-full h-full relative overflow-hidden">
            {renderGameContent()}
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-40 w-32 h-1 bg-white/40 rounded-full pointer-events-none" />
        </div>
      ) : (
        <div className="w-full h-full relative overflow-hidden">
          {renderGameContent()}
        </div>
      )}

      {/* Modals & Dialogs */}
      {isShopOpen && (
        <ShopModal
          gameState={gameState}
          onClose={() => setIsShopOpen(false)}
          onBuySeed={handleBuySeed}
          onBuyItem={handleBuyItem}
          onSetHouseColor={(color) => setGameState((prev) => ({ ...prev, houseColor: color }))}
        />
      )}

      {isOrdersOpen && (
        <OrderBoardModal
          gameState={gameState}
          onClose={() => setIsOrdersOpen(false)}
          onFulfillOrder={handleFulfillOrder}
        />
      )}

      {isTasksOpen && (
        <SeasonalTasksModal
          gameState={gameState}
          onClose={() => setIsTasksOpen(false)}
          onClaimTask={handleClaimTask}
          onAdvanceSeason={handleAdvanceSeason}
        />
      )}

      {isInventoryOpen && (
        <InventoryModal
          gameState={gameState}
          onClose={() => setIsInventoryOpen(false)}
          onSellItem={handleSellItem}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          gameState={gameState}
          onClose={() => setIsSettingsOpen(false)}
          onReturnToTitle={() => {
            setIsSettingsOpen(false);
            setScreen('TITLE');
          }}
          onToggleSFX={() => setGameState((prev) => ({ ...prev, sfxMuted: !prev.sfxMuted }))}
          onToggleAmbient={() => setGameState((prev) => ({ ...prev, ambientMuted: !prev.ambientMuted }))}
          onToggleMobileFrame={() => setGameState((prev) => ({ ...prev, mobileFrameMode: !prev.mobileFrameMode }))}
          onUpdateFarmName={(name) => setGameState((prev) => ({ ...prev, farmName: name }))}
          onResetFarm={handleResetFarm}
          onOpenInstallModal={() => {
            setIsSettingsOpen(false);
            setIsInstallModalOpen(true);
          }}
        />
      )}

      {isInstallModalOpen && (
        <PWAInstallModal onClose={() => setIsInstallModalOpen(false)} />
      )}
    </div>
  );
}
