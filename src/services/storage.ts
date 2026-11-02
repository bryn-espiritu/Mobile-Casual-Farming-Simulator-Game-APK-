import { GameState } from '../types/game';
import { createInitialTiles, getInitialOrders, getInitialTasks, GRID_SIZE } from '../constants/gameData';

const STORAGE_KEY = 'meadowbrook_farm_v1';

export function getDefaultGameState(): GameState {
  return {
    version: 1,
    farmName: 'Meadowbrook Farm',
    farmerName: 'Sunny',
    houseColor: '#b91c1c',
    coins: 350,
    gems: 15,
    xp: 0,
    level: 1,
    season: 'spring',
    seasonDay: 1,
    totalDays: 1,
    timeOfDay: 'morning',
    gridSize: GRID_SIZE,
    tiles: createInitialTiles(),
    inventory: {
      wheat: 2,
      strawberry: 1,
      egg: 2,
      milk: 1,
      seed_wheat: 8,
      seed_strawberry: 5,
      seed_carrot: 3,
    },
    tasks: getInitialTasks('spring'),
    orders: getInitialOrders(),
    selectedSeed: 'wheat',
    selectedTool: 'inspect',
    sfxMuted: false,
    ambientMuted: false,
    mobileFrameMode: false,
    totalCropsHarvested: 0,
    totalAnimalsPetted: 0,
    totalCoinsEarned: 0,
  };
}

export function loadSavedGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultGameState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tiles)) {
      return getDefaultGameState();
    }
    return parsed as GameState;
  } catch {
    return getDefaultGameState();
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

export function clearSavedGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
