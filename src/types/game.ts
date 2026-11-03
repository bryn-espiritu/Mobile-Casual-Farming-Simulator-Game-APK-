export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'morning' | 'day' | 'sunset' | 'night';
export type WeatherType =
  | 'sunny'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'petal_breeze'
  | 'autumn_wind';

export type CropType =
  | 'wheat'
  | 'strawberry'
  | 'carrot'
  | 'corn'
  | 'sunflower'
  | 'pumpkin'
  | 'frostberry'
  | 'palay'
  | 'ube'
  | 'mango';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CropDefinition {
  type: CropType;
  name: string;
  growthTimeSec: number;
  sellPrice: number;
  seedCost: number;
  xpYield: number;
  seasonPreference: Season | 'all';
  allowedSeasons: Season[];
  color: string;
  secondaryColor: string;
  description: string;
  emoji: string;
}

export type TileType =
  | 'grass'
  | 'soil'
  | 'stone_path'
  | 'wood_path'
  | 'flower_bed'
  | 'water_pond'
  | 'fish_pond'
  | 'fence';

export type StructureType =
  | 'barn'
  | 'windmill'
  | 'well'
  | 'farmhouse'
  | 'beehive'
  | 'coop'
  | 'cottage'
  | 'greenhouse'
  | 'gazebo'
  | 'shed'
  | 'bahay_kubo'
  | 'fish_pond'
  | 'cookhouse';

export type AnimalType =
  | 'chicken'
  | 'cow'
  | 'sheep'
  | 'dog'
  | 'cat'
  | 'carabao'
  | 'ostrich'
  | 'rabbit';

export interface TileCrop {
  type: CropType;
  plantedAt: number;
  watered: boolean;
  growthProgress: number; // 0 to 1
  isReady: boolean;
}

export interface TileStructure {
  id: string;
  type: StructureType;
  colorTheme?: string;
  level?: number;
  lastCollected?: number;
  fishStock?: {
    tilapia: number;
    milkfish: number;
    lastFed?: number;
    readyToHarvest?: boolean;
  };
}

export interface TileAnimal {
  id: string;
  type: AnimalType;
  name: string;
  petCount: number;
  lastPet: number;
  produceReady: boolean;
  offsetX: number;
  offsetY: number;
  wanderTargetX: number;
  wanderTargetY: number;
  isPlowing?: boolean;
}

export interface TileDecor {
  id: string;
  type: 'scarecrow' | 'lantern' | 'picnic' | 'apple_tree' | 'cherry_tree' | 'pine_tree';
}

export interface FarmTile {
  x: number;
  y: number;
  type: TileType;
  crop?: TileCrop;
  structure?: TileStructure;
  animal?: TileAnimal;
  decor?: TileDecor;
}

export type ToolMode =
  | 'inspect'
  | 'plow'
  | 'carabao_plow'
  | 'plant'
  | 'water'
  | 'harvest'
  | 'move'
  | 'shovel';

export interface SeasonalTask {
  id: string;
  season: Season;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  rewardGems: number;
  rewardXP: number;
  completed: boolean;
  claimed: boolean;
}

export interface TownOrder {
  id: string;
  customerName: string;
  customerTitle: string;
  avatarSeed: string;
  avatarColor: string;
  dialogue: string;
  requirements: Array<{
    itemKey: string;
    itemName: string;
    count: number;
    icon: string;
  }>;
  rewardCoins: number;
  rewardXP: number;
  rewardHearts: number;
  completed: boolean;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'hearth' | 'seating' | 'tables' | 'bedroom' | 'plants' | 'rugs';
  cost: number;
  icon: string;
  description: string;
  comfortBonus: number;
}

export interface PlacedFurniture {
  id: string;
  furnitureId: string;
  name: string;
  category: string;
  icon: string;
  x: number; // 0 to room grid max
  y: number; // 0 to room grid max
  rotation?: number; // 0, 90, 180, 270 degrees
  color?: string; // hex color or custom tint
  swatchName?: string; // Material swatch label (e.g. 'Golden Teak', 'Narra Mahogany')
}

export interface HousePainting {
  id: string;
  title: string;
  artist: string;
  era: string;
  description: string;
  icon: string;
  previewGradient: string;
  frameStyle: 'gold_baroque' | 'rustic_teak' | 'carved_narra' | 'modern_brass';
  comfortBonus: number;
  cost: number;
}

export interface HouseCustomization {
  level: number; // 1: Cozy Cabin, 2: Country Manor, 3: Grand Estate
  exteriorColor: string;
  roofColor: string;
  wallStyle: string; // wallpaper style
  wallPainting?: string; // selected wall painting/artwork ID
  flooring: string; // flooring style
  placedFurniture: PlacedFurniture[];
}

export interface AutomationState {
  autoHarvestEnabled: boolean;
  autoHarvestLevel: number; // 0: locked, 1: Basic (every 4s), 2: Fast (every 2s), 3: Instant (every 1s)
  autoPlantEnabled: boolean;
  autoPlantLevel: number;
  autoFeedEnabled: boolean;
  autoFeedLevel: number;
  autoWaterEnabled: boolean;
  autoWaterLevel: number;
}

export interface CookingIngredient {
  itemKey: string;
  itemName: string;
  count: number;
  icon: string;
}

export interface CookingRecipe {
  id: string;
  name: string;
  filipinoName?: string;
  category: 'breakfast' | 'main' | 'dessert' | 'beverage';
  icon: string;
  description: string;
  ingredients: CookingIngredient[];
  cookTimeSec: number;
  sellValue: number;
  buffDescription: string;
  buffType: 'growth_speed' | 'double_harvest' | 'coin_boost' | 'xp_boost';
  buffDurationSec: number;
}

export interface ActiveBuff {
  type: 'growth_speed' | 'double_harvest' | 'coin_boost' | 'xp_boost';
  label: string;
  expiresAt: number;
}

export interface GameState {
  version: number;
  farmName: string;
  farmerName: string;
  houseColor: string;
  coins: number;
  gems: number;
  xp: number;
  level: number;
  season: Season;
  seasonDay: number;
  totalDays: number;
  timeOfDay: TimeOfDay;
  isNightMode: boolean;
  weather: WeatherType;
  gridSize: number;
  tiles: FarmTile[];
  inventory: Record<string, number>;
  cookedDishes: Record<string, number>;
  activeBuff?: ActiveBuff;
  tasks: SeasonalTask[];
  orders: TownOrder[];
  selectedSeed: CropType;
  selectedTool: ToolMode;
  sfxMuted: boolean;
  ambientMuted: boolean;
  mobileFrameMode: boolean;
  totalCropsHarvested: number;
  totalAnimalsPetted: number;
  totalCoinsEarned: number;
  house: HouseCustomization;
  barnLevel: number; // 1: Rustic Granary, 2: Extended Storehouse, 3: Grand Silo
  landExpansions: number; // 0: 12x12, 1: 14x14, 2: 16x16
  automation: AutomationState;
}
