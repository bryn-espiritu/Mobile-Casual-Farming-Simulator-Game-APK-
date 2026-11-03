import { GameState } from '../types/game';
import { createInitialTiles, getInitialOrders, getInitialTasks, GRID_SIZE } from '../constants/gameData';

const STORAGE_KEY = 'naga_farm_v1';

export function getDefaultGameState(): GameState {
  return {
    version: 3,
    farmName: 'Naga Farm',
    farmerName: 'Sunny',
    houseColor: '#b91c1c',
    coins: 500,
    gems: 25,
    xp: 0,
    level: 1,
    season: 'spring',
    seasonDay: 1,
    totalDays: 1,
    timeOfDay: 'day',
    isNightMode: false,
    weather: 'sunny',
    gridSize: GRID_SIZE,
    tiles: createInitialTiles(),
    inventory: {
      wheat: 6,
      strawberry: 3,
      egg: 4,
      milk: 3,
      palay: 8,
      tilapia: 4,
      milkfish: 3,
      seed_wheat: 12,
      seed_strawberry: 6,
      seed_carrot: 4,
      seed_corn: 3,
      seed_palay: 10,
      seed_ube: 4,
      seed_mango: 2,
    },
    cookedDishes: {},
    activeBuff: undefined,
    barnLevel: 1,
    landExpansions: 0,
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
      wallPainting: 'amorsolo_rice',
      flooring: 'hardwood_oak',
      placedFurniture: [
        { id: 'furn_init_1', furnitureId: 'stone_hearth', name: 'Stone Fireplace', category: 'hearth', icon: '🔥', x: 2, y: 0, rotation: 0, color: '#eab308', swatchName: 'Golden Teak' },
        { id: 'furn_init_2', furnitureId: 'rocking_chair', name: 'Oak Rocker', category: 'seating', icon: '🪑', x: 1, y: 2, rotation: 0, color: '#d97706', swatchName: 'Golden Teak' },
        { id: 'furn_init_3', furnitureId: 'country_rug', name: 'Braided Wool Rug', category: 'rugs', icon: '🧶', x: 2, y: 2, rotation: 0, color: '#ec4899', swatchName: 'Ruby Crimson' },
        { id: 'furn_init_4', furnitureId: 'plant_fig', name: 'Potted Fiddle Leaf', category: 'plants', icon: '🪴', x: 4, y: 0, rotation: 0, color: '#22c55e', swatchName: 'Emerald Velvet' },
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
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('meadowbrook_farm_v2') || localStorage.getItem('meadowbrook_farm_v1');
    if (!raw) return getDefaultGameState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tiles)) {
      return getDefaultGameState();
    }

    const defaultState = getDefaultGameState();

    // Migrate farm name to Naga Farm
    const farmName = parsed.farmName === 'Meadowbrook Farm' ? 'Naga Farm' : (parsed.farmName || 'Naga Farm');

    // Merge in defaults for any missing new keys
    return {
      ...defaultState,
      ...parsed,
      farmName,
      barnLevel: parsed.barnLevel || 1,
      landExpansions: parsed.landExpansions || 0,
      isNightMode: parsed.isNightMode || false,
      cookedDishes: parsed.cookedDishes || {},
      activeBuff: parsed.activeBuff,
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
