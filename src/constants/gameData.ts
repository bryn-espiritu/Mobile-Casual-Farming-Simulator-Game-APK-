import { CropDefinition, CropType, FarmTile, SeasonalTask, TownOrder, Season } from '../types/game';

export const GRID_SIZE = 12; // 12x12 isometric grid

export const CROPS: Record<CropType, CropDefinition> = {
  wheat: {
    type: 'wheat',
    name: 'Golden Wheat',
    growthTimeSec: 12,
    seedCost: 6,
    sellPrice: 15,
    xpYield: 8,
    seasonPreference: 'all',
    color: '#eab308',
    secondaryColor: '#ca8a04',
    description: 'Fast-growing wholesome grain. Essential for baking rustic bread.',
    emoji: '🌾',
  },
  strawberry: {
    type: 'strawberry',
    name: 'Sweet Strawberry',
    growthTimeSec: 22,
    seedCost: 14,
    sellPrice: 38,
    xpYield: 18,
    seasonPreference: 'spring',
    color: '#f43f5e',
    secondaryColor: '#be123c',
    description: 'Juicy ruby berries that thrive in the gentle springtime breeze.',
    emoji: '🍓',
  },
  carrot: {
    type: 'carrot',
    name: 'Crisp Carrot',
    growthTimeSec: 28,
    seedCost: 18,
    sellPrice: 48,
    xpYield: 24,
    seasonPreference: 'spring',
    color: '#f97316',
    secondaryColor: '#c2410c',
    description: 'Tender root vegetable, beloved by local farm animals.',
    emoji: '🥕',
  },
  corn: {
    type: 'corn',
    name: 'Sun Sweet Corn',
    growthTimeSec: 36,
    seedCost: 26,
    sellPrice: 72,
    xpYield: 34,
    seasonPreference: 'summer',
    color: '#facc15',
    secondaryColor: '#a16207',
    description: 'Tall golden stalks laden with plump sweet summer kernels.',
    emoji: '🌽',
  },
  sunflower: {
    type: 'sunflower',
    name: 'Sunburst Sunflower',
    growthTimeSec: 45,
    seedCost: 35,
    sellPrice: 96,
    xpYield: 45,
    seasonPreference: 'summer',
    color: '#eab308',
    secondaryColor: '#78350f',
    description: 'Towering blossom that turns to face the sun. Yields seeds and honey boost.',
    emoji: '🌻',
  },
  pumpkin: {
    type: 'pumpkin',
    name: 'Spiced Pumpkin',
    growthTimeSec: 55,
    seedCost: 45,
    sellPrice: 130,
    xpYield: 60,
    seasonPreference: 'autumn',
    color: '#ea580c',
    secondaryColor: '#9a3412',
    description: 'Prized autumn gourds for festive pies and village decor.',
    emoji: '🎃',
  },
  frostberry: {
    type: 'frostberry',
    name: 'Glacier Frostberry',
    growthTimeSec: 50,
    seedCost: 42,
    sellPrice: 125,
    xpYield: 55,
    seasonPreference: 'winter',
    color: '#38bdf8',
    secondaryColor: '#0284c7',
    description: 'Hardy magical berry that glistens softly even beneath blankets of snow.',
    emoji: '🫐',
  },
};

export const SEASONS_INFO: Record<Season, { name: string; tag: string; description: string; ambientColor: string; weather: string }> = {
  spring: {
    name: 'Spring Awakening',
    tag: 'Cherry Blossoms & Green Sprouts',
    description: 'Gentle showers nourish fresh soil. Strawberries and carrots thrive.',
    ambientColor: 'rgba(236, 72, 153, 0.08)',
    weather: 'Mild & Petal Breeze',
  },
  summer: {
    name: 'Golden Summer',
    tag: 'Sunburst & Ripe Corn',
    description: 'Warm golden sun. Sunflowers bloom tall and honey flows abundantly.',
    ambientColor: 'rgba(234, 179, 8, 0.08)',
    weather: 'Bright & Warm Sun',
  },
  autumn: {
    name: 'Harvest Autumn',
    tag: 'Golden Leaves & Great Pumpkins',
    description: 'Crisp evening breezes. Time to gather giant pumpkins and pressed cider.',
    ambientColor: 'rgba(249, 115, 22, 0.09)',
    weather: 'Crisp Wind & Amber Leaves',
  },
  winter: {
    name: 'Quiet Winter',
    tag: 'Snowdrifts & Frostberries',
    description: 'A cozy blanket of snow. Keep animals warm by the fire and harvest frostberries.',
    ambientColor: 'rgba(186, 230, 253, 0.12)',
    weather: 'Gentle Flurries & Crisp Snow',
  },
};

export function getInitialTasks(season: Season): SeasonalTask[] {
  const tasksBySeason: Record<Season, SeasonalTask[]> = {
    spring: [
      {
        id: 'sp_1',
        season: 'spring',
        title: 'Spring Sowing',
        description: 'Plant 6 Strawberry seeds in tilled soil',
        targetCount: 6,
        currentCount: 0,
        rewardCoins: 120,
        rewardGems: 2,
        rewardXP: 50,
        completed: false,
        claimed: false,
      },
      {
        id: 'sp_2',
        season: 'spring',
        title: 'Morning Dew',
        description: 'Water crops 8 times to nourish their sprouts',
        targetCount: 8,
        currentCount: 0,
        rewardCoins: 90,
        rewardGems: 1,
        rewardXP: 40,
        completed: false,
        claimed: false,
      },
      {
        id: 'sp_3',
        season: 'spring',
        title: 'Fluffy Companions',
        description: 'Pet your farm animals 4 times with gentle affection',
        targetCount: 4,
        currentCount: 0,
        rewardCoins: 150,
        rewardGems: 3,
        rewardXP: 60,
        completed: false,
        claimed: false,
      },
      {
        id: 'sp_4',
        season: 'spring',
        title: 'Fresh Baskets',
        description: 'Harvest 10 crops during spring',
        targetCount: 10,
        currentCount: 0,
        rewardCoins: 180,
        rewardGems: 3,
        rewardXP: 80,
        completed: false,
        claimed: false,
      },
    ],
    summer: [
      {
        id: 'su_1',
        season: 'summer',
        title: 'Golden Fields',
        description: 'Harvest 8 stalks of Sweet Corn or Sunflowers',
        targetCount: 8,
        currentCount: 0,
        rewardCoins: 200,
        rewardGems: 3,
        rewardXP: 90,
        completed: false,
        claimed: false,
      },
      {
        id: 'su_2',
        season: 'summer',
        title: 'Thirsty Earth',
        description: 'Water 12 parched plots under the midday sun',
        targetCount: 12,
        currentCount: 0,
        rewardCoins: 140,
        rewardGems: 2,
        rewardXP: 65,
        completed: false,
        claimed: false,
      },
      {
        id: 'su_3',
        season: 'summer',
        title: 'Sweet Nectar',
        description: 'Collect produce from your animals or beehives 5 times',
        targetCount: 5,
        currentCount: 0,
        rewardCoins: 220,
        rewardGems: 4,
        rewardXP: 100,
        completed: false,
        claimed: false,
      },
    ],
    autumn: [
      {
        id: 'au_1',
        season: 'autumn',
        title: 'Great Pumpkin Patch',
        description: 'Plant and harvest 5 Spiced Pumpkins',
        targetCount: 5,
        currentCount: 0,
        rewardCoins: 250,
        rewardGems: 4,
        rewardXP: 110,
        completed: false,
        claimed: false,
      },
      {
        id: 'au_2',
        season: 'autumn',
        title: 'Rustic Pathways',
        description: 'Lay down 4 stone or timber path tiles',
        targetCount: 4,
        currentCount: 0,
        rewardCoins: 160,
        rewardGems: 2,
        rewardXP: 70,
        completed: false,
        claimed: false,
      },
      {
        id: 'au_3',
        season: 'autumn',
        title: 'Animal Wool & Milk',
        description: 'Pet your farm animals 6 times',
        targetCount: 6,
        currentCount: 0,
        rewardCoins: 210,
        rewardGems: 3,
        rewardXP: 95,
        completed: false,
        claimed: false,
      },
    ],
    winter: [
      {
        id: 'wi_1',
        season: 'winter',
        title: 'Glistening Berries',
        description: 'Harvest 6 Glacier Frostberries',
        targetCount: 6,
        currentCount: 0,
        rewardCoins: 260,
        rewardGems: 4,
        rewardXP: 120,
        completed: false,
        claimed: false,
      },
      {
        id: 'wi_2',
        season: 'winter',
        title: 'Warm Hearth',
        description: 'Care for animals 5 times on snowy mornings',
        targetCount: 5,
        currentCount: 0,
        rewardCoins: 180,
        rewardGems: 3,
        rewardXP: 80,
        completed: false,
        claimed: false,
      },
      {
        id: 'wi_3',
        season: 'winter',
        title: 'Winter Granary',
        description: 'Fulfill 3 town orders from the order board',
        targetCount: 3,
        currentCount: 0,
        rewardCoins: 300,
        rewardGems: 5,
        rewardXP: 140,
        completed: false,
        claimed: false,
      },
    ],
  };

  return tasksBySeason[season] || tasksBySeason.spring;
}

export function getInitialOrders(): TownOrder[] {
  return [
    {
      id: 'ord_1',
      customerName: 'Mayor Penny',
      customerTitle: 'Town Mayor',
      avatarSeed: 'Penny',
      avatarColor: '#3b82f6',
      dialogue: 'Welcome to our cozy valley! Could you spare some fresh golden wheat for the village banquet?',
      requirements: [
        { itemKey: 'wheat', itemName: 'Golden Wheat', count: 4, icon: '🌾' },
      ],
      rewardCoins: 95,
      rewardXP: 45,
      rewardHearts: 1,
      completed: false,
    },
    {
      id: 'ord_2',
      customerName: 'Thomas the Baker',
      customerTitle: 'Master Pastry Chef',
      avatarSeed: 'Thomas',
      avatarColor: '#f59e0b',
      dialogue: 'Ah, the aroma of morning ovens! Strawberries and farm eggs make my tarts the talk of the county.',
      requirements: [
        { itemKey: 'strawberry', itemName: 'Sweet Strawberry', count: 3, icon: '🍓' },
        { itemKey: 'egg', itemName: 'Fresh Farm Egg', count: 2, icon: '🥚' },
      ],
      rewardCoins: 180,
      rewardXP: 80,
      rewardHearts: 2,
      completed: false,
    },
    {
      id: 'ord_3',
      customerName: 'Lily the Florist',
      customerTitle: 'Botanist',
      avatarSeed: 'Lily',
      avatarColor: '#ec4899',
      dialogue: 'The morning dew is so inspiring. Do you have fresh crisp carrots or sunflowers for my floral displays?',
      requirements: [
        { itemKey: 'carrot', itemName: 'Crisp Carrot', count: 3, icon: '🥕' },
      ],
      rewardCoins: 150,
      rewardXP: 60,
      rewardHearts: 1,
      completed: false,
    },
    {
      id: 'ord_4',
      customerName: 'Grandma Willow',
      customerTitle: 'Homestead Herbalist',
      avatarSeed: 'Willow',
      avatarColor: '#10b981',
      dialogue: 'Good morning, dear! A jug of fresh creamy milk and soft wool will keep us cozy by the hearth.',
      requirements: [
        { itemKey: 'milk', itemName: 'Creamy Milk', count: 2, icon: '🥛' },
        { itemKey: 'wool', itemName: 'Soft Wool', count: 1, icon: '🧶' },
      ],
      rewardCoins: 240,
      rewardXP: 110,
      rewardHearts: 2,
      completed: false,
    },
  ];
}

export function createInitialTiles(): FarmTile[] {
  const tiles: FarmTile[] = [];

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      let type: FarmTile['type'] = 'grass';
      let crop: FarmTile['crop'] = undefined;
      let structure: FarmTile['structure'] = undefined;
      let animal: FarmTile['animal'] = undefined;
      let decor: FarmTile['decor'] = undefined;

      // Central Farmhouse at (2, 2)
      if (x === 2 && y === 2) {
        structure = { id: 'main_house', type: 'farmhouse', colorTheme: '#b91c1c' };
      }

      // Stone Path connecting entrance to farmhouse and fields
      if ((x === 2 && y >= 3 && y <= 6) || (y === 4 && x >= 2 && x <= 7)) {
        type = 'stone_path';
      }

      // Rustic Red Barn at (7, 2)
      if (x === 7 && y === 2) {
        structure = { id: 'barn_1', type: 'barn' };
      }

      // Windmill at (9, 2)
      if (x === 9 && y === 2) {
        structure = { id: 'windmill_1', type: 'windmill' };
      }

      // Stone Water Well at (4, 4)
      if (x === 4 && y === 4) {
        structure = { id: 'well_1', type: 'well' };
      }

      // Chicken coop at (2, 8)
      if (x === 2 && y === 8) {
        structure = { id: 'coop_1', type: 'coop' };
      }

      // Beehive at (1, 5)
      if (x === 1 && y === 5) {
        structure = { id: 'beehive_1', type: 'beehive' };
      }

      // Tilled plots at (4..6, 6..8)
      if (x >= 4 && x <= 6 && y >= 6 && y <= 8) {
        type = 'soil';
        const now = Date.now();
        if (x === 4 && y === 6) {
          crop = { type: 'wheat', plantedAt: now - 10000, watered: true, growthProgress: 0.8, isReady: false };
        } else if (x === 5 && y === 6) {
          crop = { type: 'wheat', plantedAt: now - 15000, watered: true, growthProgress: 1, isReady: true };
        } else if (x === 6 && y === 6) {
          crop = { type: 'strawberry', plantedAt: now - 18000, watered: true, growthProgress: 0.9, isReady: false };
        } else if (x === 4 && y === 7) {
          crop = { type: 'strawberry', plantedAt: now - 25000, watered: true, growthProgress: 1, isReady: true };
        } else if (x === 5 && y === 7) {
          crop = { type: 'carrot', plantedAt: now - 12000, watered: true, growthProgress: 0.5, isReady: false };
        } else {
          // Prepared empty soil
          crop = undefined;
        }
      }

      // Fenced pasture at (8..10, 6..8)
      if (
        (x === 8 && y >= 6 && y <= 8) ||
        (x === 10 && y >= 6 && y <= 8) ||
        (y === 8 && x >= 8 && x <= 10)
      ) {
        type = 'fence';
      }

      // Animals
      if (x === 9 && y === 7) {
        animal = {
          id: 'cow_daisy',
          type: 'cow',
          name: 'Daisy',
          petCount: 0,
          lastPet: 0,
          produceReady: true,
          offsetX: 0,
          offsetY: 0,
          wanderTargetX: 0,
          wanderTargetY: 0,
        };
      }
      if (x === 9 && y === 6) {
        animal = {
          id: 'sheep_cotton',
          type: 'sheep',
          name: 'Cotton',
          petCount: 0,
          lastPet: 0,
          produceReady: false,
          offsetX: 0,
          offsetY: 0,
          wanderTargetX: 0,
          wanderTargetY: 0,
        };
      }
      if (x === 2 && y === 7) {
        animal = {
          id: 'chicken_pip',
          type: 'chicken',
          name: 'Pip',
          petCount: 0,
          lastPet: 0,
          produceReady: true,
          offsetX: 0,
          offsetY: 0,
          wanderTargetX: 0,
          wanderTargetY: 0,
        };
      }
      if (x === 3 && y === 3) {
        animal = {
          id: 'dog_barnaby',
          type: 'dog',
          name: 'Barnaby',
          petCount: 0,
          lastPet: 0,
          produceReady: false,
          offsetX: 0,
          offsetY: 0,
          wanderTargetX: 0,
          wanderTargetY: 0,
        };
      }

      // Trees & Decor
      if (x === 1 && y === 1) {
        decor = { id: 'tree_apple_1', type: 'apple_tree' };
      }
      if (x === 10 && y === 1) {
        decor = { id: 'tree_cherry_1', type: 'cherry_tree' };
      }
      if (x === 10 && y === 10) {
        decor = { id: 'tree_pine_1', type: 'pine_tree' };
      }
      if (x === 7 && y === 7) {
        decor = { id: 'scarecrow_1', type: 'scarecrow' };
      }
      if (x === 1 && y === 4) {
        decor = { id: 'lantern_1', type: 'lantern' };
      }

      // Duck / Koi pond at (1, 10) and (2, 10)
      if ((x === 1 && y === 10) || (x === 2 && y === 10) || (x === 1 && y === 9)) {
        type = 'water_pond';
      }

      // Flower beds along front path
      if ((x === 3 && y === 5) || (x === 5 && y === 5)) {
        type = 'flower_bed';
      }

      tiles.push({ x, y, type, crop, structure, animal, decor });
    }
  }

  return tiles;
}
