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
  palay: {
    type: 'palay',
    name: 'Golden Palay (Rice)',
    growthTimeSec: 20,
    seedCost: 10,
    sellPrice: 32,
    xpYield: 16,
    seasonPreference: 'all',
    color: '#facc15',
    secondaryColor: '#854d0e',
    description: 'Hearty rice stalks grown in lush flooded terraces. A staple of every Filipino meal.',
    emoji: '🌾',
  },
  ube: {
    type: 'ube',
    name: 'Bohol Purple Yam (Ube)',
    growthTimeSec: 32,
    seedCost: 22,
    sellPrice: 65,
    xpYield: 28,
    seasonPreference: 'summer',
    color: '#9333ea',
    secondaryColor: '#581c87',
    description: 'Rich royal purple tubers prized for halaya jams, kakanin, and festive halo-halo.',
    emoji: '🍠',
  },
  mango: {
    type: 'mango',
    name: 'Guimaras Carabao Mango',
    growthTimeSec: 42,
    seedCost: 30,
    sellPrice: 88,
    xpYield: 40,
    seasonPreference: 'summer',
    color: '#f59e0b',
    secondaryColor: '#b45309',
    description: 'World-famous sweet golden carabao mango with melt-in-your-mouth honey nectar.',
    emoji: '🥭',
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
      id: 'ord_filipino_1',
      customerName: 'Mang Jose',
      customerTitle: 'Pala-isdaan Keeper',
      avatarSeed: 'Jose',
      avatarColor: '#0284c7',
      dialogue: 'Magandang araw! The village barrio fiesta needs fresh Bangus (milkfish) and golden Palay for steaming rice!',
      requirements: [
        { itemKey: 'milkfish', itemName: 'Fresh Bangus (Milkfish)', count: 2, icon: '🐟' },
        { itemKey: 'palay', itemName: 'Golden Palay (Rice)', count: 3, icon: '🌾' },
      ],
      rewardCoins: 260,
      rewardXP: 110,
      rewardHearts: 2,
      completed: false,
    },
    {
      id: 'ord_filipino_2',
      customerName: 'Aling Rosa',
      customerTitle: 'Carinderia Chef',
      avatarSeed: 'Rosa',
      avatarColor: '#e11d48',
      dialogue: 'Kumusta suki! My famous sour Sinigang sa Bayabas needs fresh Tilapia and sweet Carabao mangoes!',
      requirements: [
        { itemKey: 'tilapia', itemName: 'River Tilapia', count: 2, icon: '🐠' },
        { itemKey: 'mango', itemName: 'Carabao Mango', count: 2, icon: '🥭' },
      ],
      rewardCoins: 280,
      rewardXP: 125,
      rewardHearts: 3,
      completed: false,
    },
    {
      id: 'ord_filipino_3',
      customerName: 'Ate Maya',
      customerTitle: 'Halo-Halo & Kakanin Artisan',
      avatarSeed: 'Maya',
      avatarColor: '#7c3aed',
      dialogue: 'The summer heat is on! Fresh Bohol Ube and sweet Guimaras mangoes make the sweetest Halo-Halo in the province.',
      requirements: [
        { itemKey: 'ube', itemName: 'Purple Yam (Ube)', count: 2, icon: '🍠' },
        { itemKey: 'mango', itemName: 'Carabao Mango', count: 2, icon: '🥭' },
      ],
      rewardCoins: 310,
      rewardXP: 140,
      rewardHearts: 3,
      completed: false,
    },
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

      // Water Buffalo (Carabao / Kalabaw) at (7, 8)
      if (x === 7 && y === 8) {
        animal = {
          id: 'carabao_mayon',
          type: 'carabao',
          name: 'Mayon',
          petCount: 0,
          lastPet: 0,
          produceReady: true,
          offsetX: 0,
          offsetY: 0,
          wanderTargetX: 0,
          wanderTargetY: 0,
        };
      }

      // Palaisdaan Aquaculture Fish Pond (Tilapia & Milkfish) at (8, 9) and (9, 9)
      if (x === 8 && y === 9) {
        type = 'fish_pond';
        structure = {
          id: 'palaisdaan_1',
          type: 'fish_pond',
          fishStock: { tilapia: 4, milkfish: 3, lastFed: Date.now(), readyToHarvest: true },
        };
      }
      if (x === 9 && y === 9) {
        type = 'fish_pond';
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

export const FURNITURE_CATALOG = [
  { id: 'stone_hearth', name: 'Rustic Stone Hearth', category: 'hearth' as const, cost: 180, icon: '🔥', description: 'Crackling warm wood fire that keeps rooms toasty.', comfortBonus: 20 },
  { id: 'iron_stove', name: 'Cast-Iron Wood Stove', category: 'hearth' as const, cost: 140, icon: '🪵', description: 'Traditional country heating stove with teapot.', comfortBonus: 15 },
  { id: 'rocking_chair', name: 'Hand-Carved Rocker', category: 'seating' as const, cost: 95, icon: '🪑', description: 'Cozy curved wooden rocking chair for afternoon naps.', comfortBonus: 12 },
  { id: 'plush_armchair', name: 'Velvet Wingback Chair', category: 'seating' as const, cost: 160, icon: '🛋️', description: 'Plush forest green armchair with deep cushions.', comfortBonus: 18 },
  { id: 'country_sofa', name: 'Linen Homestead Couch', category: 'seating' as const, cost: 240, icon: '🛋️', description: 'Spacious cozy sofa with quilted pillows.', comfortBonus: 25 },
  { id: 'oak_table', name: 'Farmhouse Oak Table', category: 'tables' as const, cost: 130, icon: '🪵', description: 'Sturdy solid oak table for family meals.', comfortBonus: 14 },
  { id: 'tea_cart', name: 'Herbal Tea Station', category: 'tables' as const, cost: 110, icon: '🫖', description: 'Wheeled cart with dried chamomile and porcelain cups.', comfortBonus: 10 },
  { id: 'four_poster_bed', name: 'Quilted Canopy Bed', category: 'bedroom' as const, cost: 320, icon: '🛏️', description: 'Hand-sewn patchwork quilt with goose down pillows.', comfortBonus: 35 },
  { id: 'pine_wardrobe', name: 'Carved Pine Wardrobe', category: 'bedroom' as const, cost: 175, icon: '🚪', description: 'Spacious wardrobe smelling of fresh mountain pine.', comfortBonus: 16 },
  { id: 'country_rug', name: 'Braided Wool Rug', category: 'rugs' as const, cost: 75, icon: '🧶', description: 'Soft colorful circular braided wool mat.', comfortBonus: 8 },
  { id: 'persian_carpet', name: 'Meadow Floral Tapestry Rug', category: 'rugs' as const, cost: 120, icon: '🏵️', description: 'Detailed woven tapestry rug with botanical motifs.', comfortBonus: 14 },
  { id: 'plant_fig', name: 'Potted Fiddle Leaf', category: 'plants' as const, cost: 65, icon: '🪴', description: 'Glossy broad green leaves purifying the cottage air.', comfortBonus: 8 },
  { id: 'plant_fern', name: 'Hanging Boston Fern', category: 'plants' as const, cost: 50, icon: '🌿', description: 'Graceful emerald fronds spilling from macrame.', comfortBonus: 6 },
  { id: 'gramophone', name: 'Vintage Brass Gramophone', category: 'hearth' as const, cost: 280, icon: '🎺', description: 'Plays soothing acoustic waltzes and warm vinyl crackle.', comfortBonus: 30 },
  { id: 'grandfather_clock', name: 'Cedar Grandfather Clock', category: 'bedroom' as const, cost: 210, icon: '🕰️', description: 'Gentle rhythmic pendulum ticking soothingly.', comfortBonus: 22 },
];

export const HOUSE_LEVELS = [
  {
    level: 1,
    name: 'Cozy Timber Cabin',
    upgradeCost: 0,
    gemCost: 0,
    maxFurniture: 6,
    perk: 'Humble starter home with warm stone hearth and open studio layout.',
    minFarmLevel: 1,
  },
  {
    level: 2,
    name: 'Pastoral Country Manor',
    upgradeCost: 600,
    gemCost: 15,
    maxFurniture: 12,
    perk: 'Expanded 2-story home with dormer windows, flower boxes, and +15% crop sell value.',
    minFarmLevel: 2,
  },
  {
    level: 3,
    name: 'Grand Valley Estate',
    upgradeCost: 1500,
    gemCost: 35,
    maxFurniture: 24,
    perk: 'Victorian wrap-around porch, stained glass lanterns, and +25% experience on all harvests.',
    minFarmLevel: 4,
  },
];

export const AUTOMATION_TIERS = {
  autoHarvest: [
    { level: 1, name: 'Valley Scythe Drone', cost: 250, gems: 5, intervalSec: 5, desc: 'Automatically gathers ripe crops every 5 seconds.' },
    { level: 2, name: 'Precision Harvester MK II', cost: 650, gems: 12, intervalSec: 3, desc: 'Faster automatic crop harvesting every 3 seconds with +10% bonus coins.' },
    { level: 3, name: 'Perpetual Harvest Siphon', cost: 1400, gems: 25, intervalSec: 1.5, desc: 'Near-instantaneous crop harvesting with golden sparkle boost!' },
  ],
  autoPlant: [
    { level: 1, name: 'Mechanical Seed Drill', cost: 200, gems: 5, intervalSec: 5, desc: 'Automatically plants your selected seed into empty tilled soil.' },
    { level: 2, name: 'Pneumatic Multi-Sower', cost: 550, gems: 10, intervalSec: 2.5, desc: 'Quickly seeds all available prepared plots using stored inventory.' },
    { level: 3, name: 'Automated Bio-Seeder', cost: 1200, gems: 20, intervalSec: 1, desc: 'Continuous instant sowing for effortless sprawling harvests.' },
  ],
  autoWater: [
    { level: 1, name: 'Brass Pivot Sprinklers', cost: 180, gems: 4, intervalSec: 6, desc: 'Periodically sprays all unwatered crops to maintain 1.8x growth speed.' },
    { level: 2, name: 'Aqueduct Drip Network', cost: 480, gems: 10, intervalSec: 3, desc: 'Steady continuous hydration across the entire homestead.' },
    { level: 3, name: 'Rain-Maker Geyser Core', cost: 1100, gems: 18, intervalSec: 1, desc: 'Perpetual soil nourishment, completely eliminating manual watering.' },
  ],
  autoFeed: [
    { level: 1, name: 'Trough Dispenser & Bell', cost: 220, gems: 5, intervalSec: 30, desc: 'Automatically pets and collects from livestock every 30s.' },
    { level: 2, name: 'Automated Groomer Carousel', cost: 580, gems: 12, intervalSec: 18, desc: 'Grooms cows, sheep, and chickens regularly for double produce!' },
    { level: 3, name: 'Homestead Animal Haven', cost: 1300, gems: 25, intervalSec: 10, desc: 'Keeps all livestock in perpetual joyful contentment with heart cascades.' },
  ],
};

