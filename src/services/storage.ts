import { GameState } from '../types/game';
import { createInitialTiles, getInitialOrders, getInitialTasks, GRID_SIZE } from '../constants/gameData';

const STORAGE_KEY = 'meadowbrook_farm_v2';

export function getDefaultGameState(): GameState {
  return {
    version: 2,
    farmName: 'Meadowbrook Farm',
    farmerName: 'Sunny',
    houseColor: '#b91c1c',
    coins: 450,
    gems: 20,
    xp: 0,
    level: 1,
    season: 'spring',
    seasonDay: 1,
    totalDays: 1,
    timeOfDay: 'morning',
    weather: 'sunny',
    gridSize: GRID_SIZE,
    tiles: createInitialTiles(),
    inventory: {
      wheat: 4,
      strawberry: 2,
      egg: 3,
      milk: 2,
      tilapia: 3,
      milkfish: 2,
      seed_wheat: 10,
      seed_strawberry: 6,
      seed_carrot: 4,
      seed_corn: 2,
      seed_palay: 8,
      seed_ube: 4,
      seed_mango: 2,
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
    house: {
      level: 1,
      exteriorColor: '#b91c1c',
      roofColor: '#450a0a',
      wallStyle: 'cream_plaster',
      flooring: 'hardwood_oak',
      placedFurniture: [
        { id: 'furn_init_1', furnitureId: 'stone_hearth', name: 'Stone Fireplace', category: 'hearth', icon: '🔥', x: 2, y: 0, color: '#eab308' },
        { id: 'furn_init_2', furnitureId: 'rocking_chair', name: 'Oak Rocker', category: 'seating', icon: '🪑', x: 1, y: 2, color: '#d97706' },
        { id: 'furn_init_3', furnitureId: 'country_rug', name: 'Braided Wool Rug', category: 'rugs', icon: '🧶', x: 2, y: 2, color: '#ec4899' },
        { id: 'furn_init_4', furnitureId: 'plant_fig', name: 'Potted Fiddle Leaf', category: 'plants', icon: '🪴', x: 4, y: 0, color: '#22c55e' },
      ],
    },
    automation: {
      autoHarvestEnabled: false,
      autoHarvestLevel: 0,
      autoPlantEnabled: false,
      autoPlantLevel: 0,
      autoFeedEnabled: false,
      autoFeedLevel: 0,
      autoWaterEnabled: false,
      autoWaterLevel: 0,
    },
  };
}

export function loadSavedGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('meadowbrook_farm_v1');
    if (!raw) return getDefaultGameState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tiles)) {
      return getDefaultGameState();
    }

    const defaultState = getDefaultGameState();

    // Merge in defaults for any missing new keys
    return {
      ...defaultState,
      ...parsed,
      weather: parsed.weather || 'sunny',
      house: parsed.house || defaultState.house,
      automation: parsed.automation || defaultState.automation,
    };
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
    localStorage.removeItem('meadowbrook_farm_v1');
  } catch {
    // ignore
  }
}
