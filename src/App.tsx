/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  ToolMode,
  CropType,
  FarmTile,
  SeasonalTask,
  TownOrder,
  Season,
  TimeOfDay,
  WeatherType,
  AutomationState,
  CookingRecipe,
} from './types/game';
import {
  CROPS,
  getInitialOrders,
  getInitialTasks,
  GRID_SIZE,
  AUTOMATION_TIERS,
  getRareHarvestDrop,
  expandGridTiles,
  LAND_EXPANSIONS,
} from './constants/gameData';
import { loadSavedGameState, saveGameState, getDefaultGameState, clearSavedGameState } from './services/storage';
import { sound } from './services/audio';
import { TitleScreen } from './components/game/TitleScreen';
import { IsometricCanvas } from './components/game/IsometricCanvas';
import { Farm3DCanvas } from './components/game/Farm3DCanvas';
import { HUD } from './components/game/HUD';
import { ToolBar } from './components/game/ToolBar';
import { ShopModal } from './components/game/ShopModal';
import { OrderBoardModal } from './components/game/OrderBoardModal';
import { SeasonalTasksModal } from './components/game/SeasonalTasksModal';
import { InventoryModal } from './components/game/InventoryModal';
import { SettingsModal } from './components/game/SettingsModal';
import { PWAInstallModal } from './components/game/PWAInstallModal';
import { HouseCustomizerModal } from './components/game/HouseCustomizerModal';
import { AutomationModal } from './components/game/AutomationModal';
import { CookingModal } from './components/game/CookingModal';
import { LandExpansionModal } from './components/game/LandExpansionModal';

export default function App() {
  const [screen, setScreen] = useState<'TITLE' | 'PLAYING'>('TITLE');
  const [gameState, setGameState] = useState<GameState>(() => loadSavedGameState());
  const [is3DMode, setIs3DMode] = useState(false);

  // Modal Dialogs
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isHouseCustomizerOpen, setIsHouseCustomizerOpen] = useState(false);
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [isCookingOpen, setIsCookingOpen] = useState(false);
  const [isLandExpansionOpen, setIsLandExpansionOpen] = useState(false);

  // In-game Floating Feedback Banner (for rare harvests, buffs, and alerts)
  const [toastMessage, setToastMessage] = useState<{
    id: string;
    text: string;
    subtext?: string;
    rarity?: string;
  } | null>(null);

  // Auto-dismiss toast banner
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

  // Helper to increment seasonal task progress
  const updateTaskProgress = useCallback((actionType: 'plant' | 'water' | 'harvest' | 'pet' | 'order', count: number = 1) => {
    setGameState((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.completed || task.claimed) return task;

        let shouldAdvance = false;
        if (actionType === 'plant' && (task.title.toLowerCase().includes('sow') || task.title.toLowerCase().includes('plant'))) {
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
      // House level 3 bonus: +25% XP
      const xpMultiplier = prev.house?.level >= 3 ? 1.25 : 1.0;
      const buffMultiplier =
        prev.activeBuff && prev.activeBuff.type === 'xp_boost' && prev.activeBuff.expiresAt > Date.now()
          ? 1.5
          : 1.0;
      let currentXP = prev.xp + Math.round(amount * xpMultiplier * buffMultiplier);
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

  // Main 1-Second Simulation Tick
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        let changed = false;
        const now = Date.now();
        const isRaining = prev.weather === 'rain' || prev.weather === 'thunderstorm';

        // Check active buff expiry
        let currentBuff = prev.activeBuff;
        if (currentBuff && currentBuff.expiresAt <= now) {
          currentBuff = undefined;
          changed = true;
        }

        const isGrowthBuff = currentBuff && currentBuff.type === 'growth_speed';

        const newTiles = prev.tiles.map((tile) => {
          // Weather Hydration: Rain/Storm automatically waters any soil with crops
          let wateredState = tile.crop?.watered || false;
          if (isRaining && tile.type === 'soil' && tile.crop && !tile.crop.watered) {
            wateredState = true;
            changed = true;
          }

          // 1. Crop Growth Tick
          if (tile.crop && !tile.crop.isReady) {
            const cropDef = CROPS[tile.crop.type];
            if (cropDef) {
              const elapsedSec = (now - tile.crop.plantedAt) / 1000;
              const baseSpeed = wateredState || isRaining ? 1.8 : 1.0;
              const speedMultiplier = isGrowthBuff ? baseSpeed * 1.5 : baseSpeed;
              const progress = Math.min(1.0, (elapsedSec * speedMultiplier) / cropDef.growthTimeSec);

              if (progress !== tile.crop.growthProgress || wateredState !== tile.crop.watered) {
                changed = true;
                return {
                  ...tile,
                  crop: {
                    ...tile.crop,
                    watered: wateredState,
                    growthProgress: progress,
                    isReady: progress >= 1.0,
                  },
                };
              }
            }
          }

          // 2. Animal Subtle Wander & Produce Tick
          if (tile.animal) {
            const wanderX = Math.sin(now / 1500 + tile.x) * 4;
            const wanderY = Math.cos(now / 1800 + tile.y) * 3;
            const shouldProduce = !tile.animal.produceReady && now - tile.animal.lastPet > 40000;

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
        return { ...prev, tiles: newTiles, activeBuff: currentBuff };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen]);

  // AUTOMATION ENGINE INTERVAL (Auto-Harvest, Auto-Plant, Auto-Feed, Auto-Water)
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    let harvestTimer = 0;
    let plantTimer = 0;
    let feedTimer = 0;
    let waterTimer = 0;

    const autoInterval = setInterval(() => {
      harvestTimer += 1;
      plantTimer += 1;
      feedTimer += 1;
      waterTimer += 1;

      setGameState((prev) => {
        let updated = false;
        let newTiles = [...prev.tiles];
        let newInventory = { ...prev.inventory };
        let newCoins = prev.coins;
        let earnedHarvests = 0;
        let pettedCount = 0;

        const auto = prev.automation;

        // 1. AUTO-HARVEST
        if (auto?.autoHarvestEnabled && auto.autoHarvestLevel > 0) {
          const tier = AUTOMATION_TIERS.autoHarvest.find((t) => t.level === auto.autoHarvestLevel);
          const intervalNeeded = tier ? tier.intervalSec : 5;

          if (harvestTimer >= intervalNeeded) {
            harvestTimer = 0;
            // Harvest first 2 ready crops
            let harvestedThisCycle = 0;
            newTiles = newTiles.map((t) => {
              if (harvestedThisCycle < 3 && t.crop && t.crop.isReady) {
                harvestedThisCycle++;
                earnedHarvests++;
                const cropDef = CROPS[t.crop.type];
                // House Level 2 perk: +15% crop sell value
                const bonus = prev.house?.level >= 2 ? 1.15 : 1.0;
                const value = Math.round(cropDef.sellPrice * bonus);
                newCoins += value;
                newInventory[t.crop.type] = (newInventory[t.crop.type] ?? 0) + 1;
                updated = true;
                return { ...t, crop: undefined };
              }
              return t;
            });
            if (harvestedThisCycle > 0) {
              sound.playHarvest();
            }
          }
        }

        // 2. AUTO-PLANT
        if (auto?.autoPlantEnabled && auto.autoPlantLevel > 0) {
          const tier = AUTOMATION_TIERS.autoPlant.find((t) => t.level === auto.autoPlantLevel);
          const intervalNeeded = tier ? tier.intervalSec : 5;

          if (plantTimer >= intervalNeeded) {
            plantTimer = 0;
            const seedKey = `seed_${prev.selectedSeed}`;
            let availableSeeds = newInventory[seedKey] ?? 0;

            if (availableSeeds > 0) {
              let plantedThisCycle = 0;
              newTiles = newTiles.map((t) => {
                if (plantedThisCycle < 2 && availableSeeds > 0 && t.type === 'soil' && !t.crop) {
                  plantedThisCycle++;
                  availableSeeds--;
                  newInventory[seedKey] = availableSeeds;
                  updated = true;
                  return {
                    ...t,
                    crop: {
                      type: prev.selectedSeed,
                      plantedAt: Date.now(),
                      watered: false,
                      growthProgress: 0,
                      isReady: false,
                    },
                  };
                }
                return t;
              });
              if (plantedThisCycle > 0) {
                sound.playPlant();
              }
            }
          }
        }

        // 3. AUTO-FEED
        if (auto?.autoFeedEnabled && auto.autoFeedLevel > 0) {
          const tier = AUTOMATION_TIERS.autoFeed.find((t) => t.level === auto.autoFeedLevel);
          const intervalNeeded = tier ? tier.intervalSec : 25;

          if (feedTimer >= intervalNeeded) {
            feedTimer = 0;
            newTiles = newTiles.map((t) => {
              if (t.animal) {
                pettedCount++;
                const prod = t.animal.type === 'cow' ? 'milk' : t.animal.type === 'chicken' ? 'egg' : t.animal.type === 'sheep' ? 'wool' : '';
                if (prod) {
                  newInventory[prod] = (newInventory[prod] ?? 0) + 1;
                }
                newCoins += 25;
                updated = true;
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
            if (pettedCount > 0) {
              sound.playAnimalPet('cow');
            }
          }
        }

        // 4. AUTO-WATER SPRINKLERS
        if (auto?.autoWaterEnabled && auto.autoWaterLevel > 0) {
          const tier = AUTOMATION_TIERS.autoWater.find((t) => t.level === auto.autoWaterLevel);
          const intervalNeeded = tier ? tier.intervalSec : 6;

          if (waterTimer >= intervalNeeded) {
            waterTimer = 0;
            let wateredCount = 0;
            newTiles = newTiles.map((t) => {
              if (t.type === 'soil' && t.crop && !t.crop.watered) {
                wateredCount++;
                updated = true;
                return {
                  ...t,
                  crop: { ...t.crop, watered: true },
                };
              }
              return t;
            });
            if (wateredCount > 0) {
              sound.playWater();
            }
          }
        }

        if (!updated) return prev;

        if (earnedHarvests > 0) updateTaskProgress('harvest', earnedHarvests);
        if (pettedCount > 0) updateTaskProgress('pet', pettedCount);

        return {
          ...prev,
          coins: newCoins,
          totalCoinsEarned: prev.totalCoinsEarned + (newCoins - prev.coins),
          totalCropsHarvested: prev.totalCropsHarvested + earnedHarvests,
          totalAnimalsPetted: prev.totalAnimalsPetted + pettedCount,
          inventory: newInventory,
          tiles: newTiles,
        };
      });
    }, 1000);

    return () => clearInterval(autoInterval);
  }, [screen, updateTaskProgress]);

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
    } else if (tool === 'carabao_plow') {
      // Carabao Plow furrow: plows 3 tiles along the X axis
      const targetCoords = [
        { x, y },
        { x: x + 1, y },
        { x: x - 1, y },
      ];
      setGameState((prev) => ({
        ...prev,
        tiles: prev.tiles.map((t) => {
          const isTarget = targetCoords.some((c) => c.x === t.x && c.y === t.y);
          if (isTarget && t.type === 'grass' && !t.structure && !t.animal) {
            return { ...t, type: 'soil' };
          }
          return t;
        }),
      }));
    } else if (tool === 'plant') {
      if (tile.type === 'soil' && !tile.crop) {
        const cropDef = CROPS[gameState.selectedSeed];
        if (cropDef && cropDef.allowedSeasons && !cropDef.allowedSeasons.includes(gameState.season)) {
          sound.playTap();
          setToastMessage({
            id: `off_season_${Date.now()}`,
            text: `⚠️ Off-Season Crop!`,
            subtext: `${cropDef.name} only flourishes in ${cropDef.allowedSeasons.map((s) => s.toUpperCase()).join(' or ')}. Current season is ${gameState.season.toUpperCase()}.`,
          });
          return;
        }

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
        const hasDoubleHarvest = gameState.activeBuff?.type === 'double_harvest' && gameState.activeBuff.expiresAt > Date.now();
        const rareDrop = getRareHarvestDrop(cropType, hasDoubleHarvest);
        const isRare = Boolean(rareDrop && rareDrop.rarity !== 'common');

        const coinBuff = gameState.activeBuff?.type === 'coin_boost' && gameState.activeBuff.expiresAt > Date.now() ? 1.5 : 1.0;
        const bonus = gameState.house?.level >= 2 ? 1.15 : 1.0;
        const multiplier = rareDrop ? rareDrop.multiplier : 1;
        const revenue = Math.round(cropDef.sellPrice * multiplier * bonus * coinBuff);
        const earnedXP = Math.round(cropDef.xpYield * (isRare ? 2.5 : 1));
        const harvestQuantity = hasDoubleHarvest ? 2 : 1;

        setGameState((prev) => {
          const currentCount = prev.inventory[cropType] ?? 0;
          const rareCount = rareDrop ? (prev.inventory[rareDrop.itemKey] ?? 0) : 0;
          const newInv: Record<string, number> = {
            ...prev.inventory,
            [cropType]: currentCount + harvestQuantity,
          };
          if (rareDrop) {
            newInv[rareDrop.itemKey] = rareCount + 1;
          }

          return {
            ...prev,
            coins: prev.coins + revenue,
            totalCoinsEarned: prev.totalCoinsEarned + revenue,
            totalCropsHarvested: prev.totalCropsHarvested + harvestQuantity,
            inventory: newInv,
            tiles: prev.tiles.map((t) => (t.x === x && t.y === y ? { ...t, crop: undefined } : t)),
          };
        });

        if (rareDrop && (rareDrop.rarity === 'rare' || rareDrop.rarity === 'epic' || rareDrop.rarity === 'legendary')) {
          sound.playRareHarvest(rareDrop.rarity);
          setToastMessage({
            id: `rare_${Date.now()}`,
            text: `${rareDrop.rarity.toUpperCase()} HARVEST!`,
            subtext: `You gathered ${rareDrop.name}! (${rareDrop.multiplier}x coin value)`,
            rarity: rareDrop.rarity,
          });
        } else {
          sound.playHarvest();
        }

        addXP(earnedXP);
        updateTaskProgress('harvest', harvestQuantity);
      }
    } else if (tool === 'move') {
      setMovingTile(tile);
    } else if (tool === 'shovel') {
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
      let rareItem = '';
      let rareRarity = '';
      let rareName = '';
      let rareMultiplier = 1;
      let animalType = 'cow';

      const newTiles = prev.tiles.map((t) => {
        if (t.animal && t.animal.id === animalId) {
          animalType = t.animal.type;
          const produceReady = t.animal.produceReady;
          if (produceReady) {
            if (t.animal.type === 'carabao') {
              collectedProduce = 'carabao_milk';
              rewardCoins = 60;
              rewardXP = 35;
            } else if (t.animal.type === 'cow') {
              collectedProduce = 'milk';
              rewardCoins = 40;
              rewardXP = 25;
            } else if (t.animal.type === 'chicken') {
              collectedProduce = 'egg';
              rewardCoins = 30;
              rewardXP = 20;
            } else if (t.animal.type === 'sheep') {
              collectedProduce = 'wool';
              rewardCoins = 45;
              rewardXP = 25;
            } else if (t.animal.type === 'ostrich') {
              collectedProduce = 'ostrich_egg';
              rewardCoins = 85;
              rewardXP = 45;
            } else if (t.animal.type === 'rabbit') {
              collectedProduce = 'rabbit_wool';
              rewardCoins = 50;
              rewardXP = 30;
            } else {
              collectedProduce = 'egg';
            }

            // Rare Produce Check
            if (collectedProduce) {
              const hasDoubleHarvest = prev.activeBuff?.type === 'double_harvest' && prev.activeBuff.expiresAt > Date.now();
              const drop = getRareHarvestDrop(collectedProduce, hasDoubleHarvest);
              if (drop && drop.rarity !== 'common') {
                rareItem = drop.itemKey;
                rareRarity = drop.rarity;
                rareName = drop.name;
                rareMultiplier = drop.multiplier;
                rewardCoins = Math.round(rewardCoins * drop.multiplier);
              }
            }
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

      sound.playAnimalPet(animalType);

      const newInventory = { ...prev.inventory };
      if (collectedProduce) {
        newInventory[collectedProduce] = (newInventory[collectedProduce] ?? 0) + 1;
      }
      if (rareItem) {
        newInventory[rareItem] = (newInventory[rareItem] ?? 0) + 1;
      }

      if (rareRarity && rareRarity !== 'common') {
        sound.playRareHarvest(rareRarity as any);
        setToastMessage({
          id: `rare_produce_${Date.now()}`,
          text: `${rareRarity.toUpperCase()} PRODUCE!`,
          subtext: `Your animal yielded ${rareName}! (${rareMultiplier}x value)`,
          rarity: rareRarity,
        });
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
    if (structureType === 'farmhouse' || structureType === 'cottage' || structureType === 'bahay_kubo') {
      setIsHouseCustomizerOpen(true);
    } else if (structureType === 'cookhouse') {
      setIsCookingOpen(true);
    } else if (structureType === 'fish_pond') {
      // Aquaculture catch from Palaisdaan (Tilapia & Milkfish)
      const isTilapia = Math.random() > 0.45;
      const fishItem = isTilapia ? 'tilapia' : 'milkfish';
      const baseCoinVal = isTilapia ? 55 : 85;

      const hasDoubleHarvest = gameState.activeBuff?.type === 'double_harvest' && gameState.activeBuff.expiresAt > Date.now();
      const rareDrop = getRareHarvestDrop(fishItem, hasDoubleHarvest);
      const isRare = Boolean(rareDrop && rareDrop.rarity !== 'common');
      const multiplier = rareDrop ? rareDrop.multiplier : 1;
      const fishCoinVal = Math.round(baseCoinVal * multiplier);

      sound.playFishCatch();
      if (rareDrop && (rareDrop.rarity === 'rare' || rareDrop.rarity === 'epic' || rareDrop.rarity === 'legendary')) {
        sound.playRareHarvest(rareDrop.rarity);
        setToastMessage({
          id: `rare_fish_${Date.now()}`,
          text: `${rareDrop.rarity.toUpperCase()} CATCH!`,
          subtext: `You hooked a ${rareDrop.name}! (${rareDrop.multiplier}x coin value)`,
          rarity: rareDrop.rarity,
        });
      }

      setGameState((prev) => ({
        ...prev,
        coins: prev.coins + fishCoinVal,
        totalCoinsEarned: prev.totalCoinsEarned + fishCoinVal,
        inventory: {
          ...prev.inventory,
          [fishItem]: (prev.inventory[fishItem] ?? 0) + 1,
          ...(rareDrop ? { [rareDrop.itemKey]: (prev.inventory[rareDrop.itemKey] ?? 0) + 1 } : {}),
        },
      }));
      addXP(isRare ? 50 : 25);
    } else if (structureType === 'barn') {
      setIsLandExpansionOpen(true);
    } else if (structureType === 'coop' || structureType === 'shed') {
      setIsInventoryOpen(true);
    } else if (structureType === 'well') {
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
    } else if (structureType === 'greenhouse') {
      setIsShopOpen(true);
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
      const weatherMap: Record<Season, WeatherType> = {
        spring: 'petal_breeze',
        summer: 'sunny',
        autumn: 'autumn_wind',
        winter: 'snow',
      };

      return {
        ...prev,
        season: nextSeason,
        weather: weatherMap[nextSeason] || 'sunny',
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

  // Cycle Weather (Sunny -> Rain -> Thunderstorm -> Snow -> Petal Breeze -> Autumn Wind)
  const handleCycleWeather = useCallback(() => {
    const weathers: WeatherType[] = ['sunny', 'rain', 'thunderstorm', 'snow', 'petal_breeze', 'autumn_wind'];
    setGameState((prev) => {
      const current = prev.weather || 'sunny';
      const nextIdx = (weathers.indexOf(current) + 1) % weathers.length;
      const nextWeather = weathers[nextIdx];
      if (nextWeather === 'thunderstorm') {
        sound.playThunder();
      } else if (nextWeather === 'rain') {
        sound.playWater();
      }
      return { ...prev, weather: nextWeather };
    });
  }, []);

  // Toggle Time of Day (Morning -> Day -> Sunset -> Night)
  const handleToggleTimeOfDay = useCallback(() => {
    const times: TimeOfDay[] = ['morning', 'day', 'sunset', 'night'];
    setGameState((prev) => {
      const nextIdx = (times.indexOf(prev.timeOfDay) + 1) % times.length;
      const nextTime = times[nextIdx];
      return {
        ...prev,
        timeOfDay: nextTime,
        isNightMode: nextTime === 'night',
      };
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

  // Buying Items / Livestock / Decor / Buildings
  const handleBuyItem = useCallback((itemId: string, itemName: string, cost: number, category: string) => {
    setGameState((prev) => {
      if (prev.coins < cost) return prev;

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
          } else if (category === 'building') {
            const stType = itemId.replace('building_', '') as any;
            if (stType === 'fish_pond') {
              return {
                ...tile,
                type: 'fish_pond',
              };
            }
            return {
              ...tile,
              structure: {
                id: `${stType}_${Date.now()}`,
                type: stType,
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

  // House Architecture Upgrade
  const handleUpgradeHouseLevel = useCallback((nextLevel: number, coinCost: number, gemCost: number) => {
    setGameState((prev) => {
      if (prev.coins < coinCost || prev.gems < gemCost) return prev;
      return {
        ...prev,
        coins: prev.coins - coinCost,
        gems: prev.gems - gemCost,
        house: {
          ...prev.house,
          level: nextLevel,
        },
      };
    });
  }, []);

  // House Exterior Paint
  const handleUpdateHouseColors = useCallback((exteriorColor: string, roofColor: string) => {
    setGameState((prev) => ({
      ...prev,
      houseColor: exteriorColor,
      house: {
        ...prev.house,
        exteriorColor,
        roofColor,
      },
    }));
  }, []);

  // Furniture Placement (Sims-style placement)
  const handlePlaceFurniture = useCallback((
    furnitureId: string,
    name: string,
    category: string,
    icon: string,
    x: number,
    y: number,
    cost: number,
    rotation: number = 0,
    color: string = '#d97706',
    swatchName: string = 'Golden Teak'
  ) => {
    setGameState((prev) => {
      if (prev.coins < cost) return prev;
      const newPlaced = [
        ...prev.house.placedFurniture.filter((f) => !(f.x === x && f.y === y)),
        {
          id: `placed_${Date.now()}`,
          furnitureId,
          name,
          category,
          icon,
          x,
          y,
          rotation,
          color,
          swatchName,
        },
      ];

      return {
        ...prev,
        coins: prev.coins - cost,
        house: {
          ...prev.house,
          placedFurniture: newPlaced,
        },
      };
    });
  }, []);

  // Move Furniture (Sims-style repositioning)
  const handleMoveFurniture = useCallback((placedId: string, newX: number, newY: number) => {
    sound.playMoveFurniture();
    setGameState((prev) => {
      const isOccupied = prev.house.placedFurniture.some((f) => f.id !== placedId && f.x === newX && f.y === newY);
      if (isOccupied) return prev;

      return {
        ...prev,
        house: {
          ...prev.house,
          placedFurniture: prev.house.placedFurniture.map((f) =>
            f.id === placedId ? { ...f, x: newX, y: newY } : f
          ),
        },
      };
    });
  }, []);

  // Rotate Furniture (Sims-style 90° rotation)
  const handleRotateFurniture = useCallback((placedId: string) => {
    sound.playRotate();
    setGameState((prev) => ({
      ...prev,
      house: {
        ...prev.house,
        placedFurniture: prev.house.placedFurniture.map((f) => {
          if (f.id === placedId) {
            const nextRotation = (((f.rotation || 0) + 90) % 360);
            return { ...f, rotation: nextRotation };
          }
          return f;
        }),
      },
    }));
  }, []);

  // Customize Furniture Material / Swatch Color
  const handleCustomizeFurnitureSwatch = useCallback((placedId: string, color: string, swatchName: string) => {
    sound.playPaintApply();
    setGameState((prev) => ({
      ...prev,
      house: {
        ...prev.house,
        placedFurniture: prev.house.placedFurniture.map((f) =>
          f.id === placedId ? { ...f, color, swatchName } : f
        ),
      },
    }));
  }, []);

  // Change Wallpaper & Floor style
  const handleUpdateWallAndFloor = useCallback((wallStyle: string, flooring: string) => {
    sound.playPaintApply();
    setGameState((prev) => ({
      ...prev,
      house: {
        ...prev.house,
        wallStyle,
        flooring,
      },
    }));
  }, []);

  // Change House Painting ("change the painting of my Home")
  const handleChangeHousePainting = useCallback((paintingId: string, cost: number) => {
    setGameState((prev) => {
      if (prev.coins < cost) return prev;
      sound.playPaintApply();
      setToastMessage({
        id: `painting_${Date.now()}`,
        text: `🖼️ Masterpiece Hung!`,
        subtext: `Your homestead wall is now adorned with fine art.`,
        rarity: 'epic',
      });
      return {
        ...prev,
        coins: prev.coins - cost,
        house: {
          ...prev.house,
          wallPainting: paintingId,
        },
      };
    });
    addXP(35);
  }, [addXP]);

  // Furniture Removal
  const handleRemoveFurniture = useCallback((placedId: string) => {
    sound.playTap();
    setGameState((prev) => ({
      ...prev,
      house: {
        ...prev.house,
        placedFurniture: prev.house.placedFurniture.filter((f) => f.id !== placedId),
      },
    }));
  }, []);

  // Automation Toggle
  const handleToggleAutomation = useCallback((key: keyof AutomationState) => {
    setGameState((prev) => ({
      ...prev,
      automation: {
        ...prev.automation,
        [key]: !prev.automation[key],
      },
    }));
  }, []);

  // Automation Upgrade
  const handleUpgradeAutomation = useCallback((
    type: 'autoHarvest' | 'autoPlant' | 'autoFeed' | 'autoWater',
    targetLevel: number,
    costCoins: number,
    costGems: number
  ) => {
    setGameState((prev) => {
      if (prev.coins < costCoins || prev.gems < costGems) return prev;
      const levelKey = `${type}Level` as keyof AutomationState;
      const enabledKey = `${type}Enabled` as keyof AutomationState;

      return {
        ...prev,
        coins: prev.coins - costCoins,
        gems: prev.gems - costGems,
        automation: {
          ...prev.automation,
          [levelKey]: targetLevel,
          [enabledKey]: true,
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

  // Cooking Recipe Preparation
  const handleCookRecipe = useCallback((recipe: CookingRecipe) => {
    setGameState((prev) => {
      // Deduct ingredients
      const hasAll = recipe.ingredients.every((ing) => (prev.inventory[ing.itemKey] ?? 0) >= ing.count);
      if (!hasAll) return prev;

      const newInventory = { ...prev.inventory };
      recipe.ingredients.forEach((ing) => {
        newInventory[ing.itemKey] = (newInventory[ing.itemKey] ?? 0) - ing.count;
      });

      // Add dish to inventory
      newInventory[recipe.id] = (newInventory[recipe.id] ?? 0) + 1;

      const currentCooked = prev.cookedDishes || {};
      const newCooked = {
        ...currentCooked,
        [recipe.id]: (currentCooked[recipe.id] ?? 0) + 1,
      };

      return {
        ...prev,
        coins: prev.coins + 30,
        totalCoinsEarned: prev.totalCoinsEarned + 30,
        inventory: newInventory,
        cookedDishes: newCooked,
      };
    });

    sound.playCookSuccess();
    addXP(40);
    setToastMessage({
      id: `cook_${Date.now()}`,
      text: `🍳 Prepared ${recipe.filipinoName || recipe.name}!`,
      subtext: `Ready to consume for buffs or sell in your Kusina inventory.`,
    });
  }, [addXP]);

  // Consuming cooked meal to activate buff
  const handleEatDish = useCallback((recipe: CookingRecipe) => {
    setGameState((prev) => {
      const count = prev.inventory[recipe.id] ?? 0;
      if (count <= 0) return prev;

      const newInventory = {
        ...prev.inventory,
        [recipe.id]: count - 1,
      };

      const expiresAt = Date.now() + recipe.buffDurationSec * 1000;
      const activeBuff = {
        type: recipe.buffType,
        label: recipe.buffDescription,
        expiresAt,
      };

      return {
        ...prev,
        inventory: newInventory,
        activeBuff,
      };
    });

    sound.playCookSuccess();
    setToastMessage({
      id: `eat_${Date.now()}`,
      text: `✨ Enjoyed ${recipe.name}!`,
      subtext: `Active Buff: ${recipe.buffDescription} (${recipe.buffDurationSec}s)`,
    });
  }, []);

  // Land Expansion
  const handleExpandLand = useCallback(() => {
    setGameState((prev) => {
      const currentIdx = prev.landExpansions || 0;
      const nextExp = LAND_EXPANSIONS[currentIdx];
      if (!nextExp) return prev;

      const houseLvl = prev.house?.level || 1;
      const barnLvl = prev.barnLevel || 1;
      if (
        houseLvl < nextExp.minHouseLevel ||
        barnLvl < nextExp.minBarnLevel ||
        prev.coins < nextExp.cost ||
        prev.gems < nextExp.gems
      ) {
        return prev;
      }

      const nextGridSize = nextExp.targetGridSize;
      const newTiles = expandGridTiles(prev.tiles, prev.gridSize, nextGridSize);

      sound.playExpandLand();
      setToastMessage({
        id: `expand_${Date.now()}`,
        text: `🏞️ Naga Farm Expanded!`,
        subtext: `Acreage widened to ${nextGridSize}×${nextGridSize}! More fertile soil awaits your plow.`,
        rarity: 'legendary',
      });

      return {
        ...prev,
        coins: prev.coins - nextExp.cost,
        gems: prev.gems - nextExp.gems,
        gridSize: nextGridSize,
        landExpansions: currentIdx + 1,
        tiles: newTiles,
      };
    });
    addXP(150);
  }, [addXP]);

  // Barn Upgrade
  const handleUpgradeBarn = useCallback((level: number, cost: number) => {
    setGameState((prev) => {
      if (prev.coins < cost) return prev;

      sound.playHammer();
      setToastMessage({
        id: `barn_${Date.now()}`,
        text: `🌾 Granary Upgraded to Level ${level}!`,
        subtext: `Extended silo capacity for Naga Farm harvests.`,
      });

      return {
        ...prev,
        coins: prev.coins - cost,
        barnLevel: level,
      };
    });
    addXP(75);
  }, [addXP]);

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
        {/* Farm View: 3D Three.js Mode or 60fps 2D Isometric Canvas */}
        {is3DMode ? (
          <Farm3DCanvas
            gameState={gameState}
            onTileAction={handleTileAction}
            onAnimalPet={handleAnimalPet}
            onStructureClick={handleStructureClick}
            movingTile={movingTile}
            onPlaceMovedTile={handlePlaceMovedTile}
            onCancelMove={() => setMovingTile(null)}
          />
        ) : (
          <IsometricCanvas
            gameState={gameState}
            onTileAction={handleTileAction}
            onAnimalPet={handleAnimalPet}
            onStructureClick={handleStructureClick}
            movingTile={movingTile}
            onPlaceMovedTile={handlePlaceMovedTile}
            onCancelMove={() => setMovingTile(null)}
          />
        )}

        {/* Low-Occlusion HUD */}
        <HUD
          gameState={gameState}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenOrders={() => setIsOrdersOpen(true)}
          onOpenTasks={() => setIsTasksOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHouseCustomizer={() => setIsHouseCustomizerOpen(true)}
          onOpenAutomation={() => setIsAutomationOpen(true)}
          onOpenCooking={() => setIsCookingOpen(true)}
          onOpenLandExpansion={() => setIsLandExpansionOpen(true)}
          onAdvanceDay={handleAdvanceDay}
          onToggleTimeOfDay={handleToggleTimeOfDay}
          onCycleWeather={handleCycleWeather}
          is3DMode={is3DMode}
          onToggle3DMode={() => setIs3DMode(!is3DMode)}
        />

        {/* Floating Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-[90vw] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
            <div
              className={`px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border text-center transition-all ${
                toastMessage.rarity === 'legendary'
                  ? 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-amber-500/30'
                  : toastMessage.rarity === 'epic'
                  ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-purple-500/30'
                  : toastMessage.rarity === 'rare'
                  ? 'bg-sky-950/90 border-sky-400 text-sky-200 shadow-sky-500/30'
                  : 'bg-slate-900/90 border-emerald-500/40 text-emerald-200 shadow-emerald-500/20'
              }`}
            >
              <div className="font-bold text-xs sm:text-sm tracking-wide">{toastMessage.text}</div>
              {toastMessage.subtext && (
                <div className="text-[11px] opacity-90 font-medium mt-0.5">{toastMessage.subtext}</div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Thumb Toolbar */}
        <ToolBar
          selectedTool={gameState.selectedTool}
          onSelectTool={(tool) => setGameState((prev) => ({ ...prev, selectedTool: tool }))}
          selectedSeed={gameState.selectedSeed}
          onSelectSeed={(seed) => setGameState((prev) => ({ ...prev, selectedSeed: seed }))}
          inventory={gameState.inventory}
          onOpenShop={() => setIsShopOpen(true)}
          season={gameState.season}
        />
      </div>
    );
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0c140f] flex items-center justify-center">
      {gameState.mobileFrameMode ? (
        <div className="relative w-full max-w-[430px] h-full max-h-[890px] rounded-[44px] overflow-hidden shadow-2xl border-[8px] border-slate-900 bg-black flex flex-col">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 w-32 h-6 bg-slate-900 rounded-b-2xl flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-800 rounded-full" />
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-3 border border-slate-800" />
          </div>

          <div className="flex-1 w-full h-full relative overflow-hidden">
            {renderGameContent()}
          </div>

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
          onOpenHouseCustomizer={() => setIsHouseCustomizerOpen(true)}
          onOpenAutomation={() => setIsAutomationOpen(true)}
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

      {isHouseCustomizerOpen && (
        <HouseCustomizerModal
          gameState={gameState}
          onClose={() => setIsHouseCustomizerOpen(false)}
          onUpgradeHouseLevel={handleUpgradeHouseLevel}
          onUpdateColors={handleUpdateHouseColors}
          onPlaceFurniture={handlePlaceFurniture}
          onMoveFurniture={handleMoveFurniture}
          onRotateFurniture={handleRotateFurniture}
          onCustomizeFurnitureSwatch={handleCustomizeFurnitureSwatch}
          onRemoveFurniture={handleRemoveFurniture}
          onChangeHousePainting={handleChangeHousePainting}
          onUpdateWallAndFloor={handleUpdateWallAndFloor}
        />
      )}

      {isAutomationOpen && (
        <AutomationModal
          gameState={gameState}
          onClose={() => setIsAutomationOpen(false)}
          onToggleAutomation={handleToggleAutomation}
          onUpgradeAutomation={handleUpgradeAutomation}
        />
      )}

      {isCookingOpen && (
        <CookingModal
          gameState={gameState}
          onClose={() => setIsCookingOpen(false)}
          onCookRecipe={handleCookRecipe}
          onEatDish={handleEatDish}
        />
      )}

      {isLandExpansionOpen && (
        <LandExpansionModal
          gameState={gameState}
          onClose={() => setIsLandExpansionOpen(false)}
          onExpandLand={handleExpandLand}
          onUpgradeBarn={handleUpgradeBarn}
          onOpenHouseCustomizer={() => {
            setIsLandExpansionOpen(false);
            setIsHouseCustomizerOpen(true);
          }}
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
