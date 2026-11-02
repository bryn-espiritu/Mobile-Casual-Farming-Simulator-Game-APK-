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

export interface CropDefinition {
  type: CropType;
  name: string;
  growthTimeSec: number;
  sellPrice: number;
  seedCost: number;
  xpYield: number;
  seasonPreference: Season | 'all';
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
  | 'fish_pond';

export type AnimalType =
  | 'chicken'
  | 'cow'
  | 'sheep'
  | 'dog'
  | 'cat'
  | 'carabao';

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
  x: number; // 0 to 5 room grid
  y: number; // 0 to 5 room grid
  color?: string;
}

export interface HouseCustomization {
  level: number; // 1: Cozy Cabin, 2: Country Manor, 3: Grand Estate
  exteriorColor: string;
  roofColor: string;
  wallStyle: string;
  flooring: string;
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
  weather: WeatherType;
  gridSize: number;
  tiles: FarmTile[];
  inventory: Record<string, number>;
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
  automation: AutomationState;
}
