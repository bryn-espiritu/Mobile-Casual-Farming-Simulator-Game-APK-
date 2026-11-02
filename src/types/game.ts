export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'morning' | 'day' | 'sunset' | 'night';

export type CropType =
  | 'wheat'
  | 'strawberry'
  | 'carrot'
  | 'corn'
  | 'sunflower'
  | 'pumpkin'
  | 'frostberry';

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
  | 'fence';

export type StructureType =
  | 'barn'
  | 'windmill'
  | 'well'
  | 'farmhouse'
  | 'beehive'
  | 'coop';

export type AnimalType =
  | 'chicken'
  | 'cow'
  | 'sheep'
  | 'dog'
  | 'cat';

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
  lastCollected?: number;
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

export interface InventoryItem {
  id: string;
  name: string;
  category: 'crop' | 'animal' | 'seed' | 'structure' | 'decor';
  count: number;
  sellPrice: number;
  icon: string;
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
}
