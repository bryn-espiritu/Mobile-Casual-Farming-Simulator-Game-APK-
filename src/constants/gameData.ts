import { CropDefinition, CropType, FarmTile, SeasonalTask, TownOrder, Season, CookingRecipe, ItemRarity, HousePainting } from '../types/game';

export const GRID_SIZE = 12; // 12x12 initial isometric grid

export const CROPS: Record<CropType, CropDefinition> = {
  wheat: {
    type: 'wheat',
    name: 'Golden Wheat',
    growthTimeSec: 12,
    seedCost: 6,
    sellPrice: 15,
    xpYield: 8,
    seasonPreference: 'all',
    allowedSeasons: ['spring', 'summer', 'autumn', 'winter'],
    color: '#eab308',
    secondaryColor: '#ca8a04',
    description: 'Wholesome universal grain that grows across all four seasons. Essential for baking rustic breads.',
    emoji: '🌾',
  },
  strawberry: {
    type: 'strawberry',
    name: 'Sweet Strawberry',
    growthTimeSec: 20,
    seedCost: 14,
    sellPrice: 38,
    xpYield: 18,
    seasonPreference: 'spring',
    allowedSeasons: ['spring'],
    color: '#f43f5e',
    secondaryColor: '#be123c',
    description: 'Juicy ruby berries that strictly require gentle Spring sunshine and spring showers.',
    emoji: '🍓',
  },
  carrot: {
    type: 'carrot',
    name: 'Crisp Carrot',
    growthTimeSec: 25,
    seedCost: 18,
    sellPrice: 48,
    xpYield: 24,
    seasonPreference: 'spring',
    allowedSeasons: ['spring', 'autumn'],
    color: '#f97316',
    secondaryColor: '#c2410c',
    description: 'Tender root vegetable thriving in crisp Spring and mild Autumn conditions.',
    emoji: '🥕',
  },
  corn: {
    type: 'corn',
    name: 'Sun Sweet Corn',
    growthTimeSec: 32,
    seedCost: 26,
    sellPrice: 72,
    xpYield: 34,
    seasonPreference: 'summer',
    allowedSeasons: ['summer'],
    color: '#facc15',
    secondaryColor: '#a16207',
    description: 'Tall golden stalks demanding intense Summer warmth to produce plump kernels.',
    emoji: '🌽',
  },
  sunflower: {
    type: 'sunflower',
    name: 'Sunburst Sunflower',
    growthTimeSec: 40,
    seedCost: 35,
    sellPrice: 96,
    xpYield: 45,
    seasonPreference: 'summer',
    allowedSeasons: ['summer'],
    color: '#eab308',
    secondaryColor: '#78350f',
    description: 'Summer specialty flower that basks in the heat and attracts wild honeybees.',
    emoji: '🌻',
  },
  pumpkin: {
    type: 'pumpkin',
    name: 'Spiced Pumpkin',
    growthTimeSec: 45,
    seedCost: 45,
    sellPrice: 130,
    xpYield: 60,
    seasonPreference: 'autumn',
    allowedSeasons: ['autumn'],
    color: '#ea580c',
    secondaryColor: '#9a3412',
    description: 'Prized Autumn gourds harvested during crisp October breezes for festival pies.',
    emoji: '🎃',
  },
  frostberry: {
    type: 'frostberry',
    name: 'Glacier Frostberry',
    growthTimeSec: 42,
    seedCost: 42,
    sellPrice: 125,
    xpYield: 55,
    seasonPreference: 'winter',
    allowedSeasons: ['winter'],
    color: '#38bdf8',
    secondaryColor: '#0284c7',
    description: 'Exclusive magical Winter berry that can only germinate amidst freezing snow.',
    emoji: '🫐',
  },
  palay: {
    type: 'palay',
    name: 'Golden Palay (Rice)',
    growthTimeSec: 18,
    seedCost: 10,
    sellPrice: 32,
    xpYield: 16,
    seasonPreference: 'all',
    allowedSeasons: ['spring', 'summer', 'autumn'],
    color: '#facc15',
    secondaryColor: '#854d0e',
    description: 'Hearty Philippine lowland rice cultivated across Spring, Summer, and Autumn terraces.',
    emoji: '🌾',
  },
  ube: {
    type: 'ube',
    name: 'Bohol Purple Yam (Ube)',
    growthTimeSec: 30,
    seedCost: 22,
    sellPrice: 65,
    xpYield: 28,
    seasonPreference: 'summer',
    allowedSeasons: ['summer', 'autumn'],
    color: '#9333ea',
    secondaryColor: '#581c87',
    description: 'Royal purple tuber prized for halaya jams; thrives through tropical Summer & Autumn.',
    emoji: '🍠',
  },
  mango: {
    type: 'mango',
    name: 'Guimaras Carabao Mango',
    growthTimeSec: 38,
    seedCost: 30,
    sellPrice: 88,
    xpYield: 40,
    seasonPreference: 'summer',
    allowedSeasons: ['spring', 'summer'],
    color: '#f59e0b',
    secondaryColor: '#b45309',
    description: 'World-renowned sweet Philippine mango blossoming in Spring and ripening in Summer.',
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
  { id: 'dining_chair', name: 'Narra Dining Chair', category: 'seating' as const, cost: 75, icon: '🪑', description: 'Handcrafted solid dining chair with woven cane seat.', comfortBonus: 10 },
  { id: 'plush_armchair', name: 'Velvet Wingback Chair', category: 'seating' as const, cost: 160, icon: '🛋️', description: 'Plush armchair with deep cushions and high backrest.', comfortBonus: 18 },
  { id: 'country_sofa', name: 'Linen Homestead Couch', category: 'seating' as const, cost: 240, icon: '🛋️', description: 'Spacious cozy 3-seater sofa with embroidered cushions.', comfortBonus: 25 },
  { id: 'oak_table', name: 'Farmhouse Oak Table', category: 'tables' as const, cost: 130, icon: '🪵', description: 'Sturdy solid oak table for family meals.', comfortBonus: 14 },
  { id: 'coffee_table', name: 'Carved Coffee Table', category: 'tables' as const, cost: 85, icon: '☕', description: 'Low wooden coffee table with shelf for magazines.', comfortBonus: 9 },
  { id: 'tea_cart', name: 'Herbal Tea Station', category: 'tables' as const, cost: 110, icon: '🫖', description: 'Wheeled cart with dried chamomile and porcelain cups.', comfortBonus: 10 },
  { id: 'desk_study', name: 'Homestead Writing Desk', category: 'tables' as const, cost: 165, icon: '✍️', description: 'Cedar wood secretary desk with brass drawer handles.', comfortBonus: 15 },
  { id: 'four_poster_bed', name: 'Quilted Canopy Bed', category: 'bedroom' as const, cost: 320, icon: '🛏️', description: 'Hand-sewn patchwork quilt with goose down pillows.', comfortBonus: 35 },
  { id: 'pine_wardrobe', name: 'Carved Pine Wardrobe', category: 'bedroom' as const, cost: 175, icon: '🚪', description: 'Spacious wardrobe smelling of fresh mountain pine.', comfortBonus: 16 },
  { id: 'bookshelf', name: 'Grand Library Bookshelf', category: 'bedroom' as const, cost: 190, icon: '📚', description: 'Floor-to-ceiling shelves packed with agrarian lore.', comfortBonus: 20 },
  { id: 'country_rug', name: 'Braided Wool Rug', category: 'rugs' as const, cost: 75, icon: '🧶', description: 'Soft colorful circular braided wool mat.', comfortBonus: 8 },
  { id: 'persian_carpet', name: 'Meadow Tapestry Rug', category: 'rugs' as const, cost: 120, icon: '🏵️', description: 'Detailed woven tapestry rug with botanical motifs.', comfortBonus: 14 },
  { id: 'plant_fig', name: 'Potted Fiddle Leaf', category: 'plants' as const, cost: 65, icon: '🪴', description: 'Glossy broad green leaves purifying the cottage air.', comfortBonus: 8 },
  { id: 'plant_fern', name: 'Hanging Boston Fern', category: 'plants' as const, cost: 50, icon: '🌿', description: 'Graceful emerald fronds spilling from macrame.', comfortBonus: 6 },
  { id: 'gramophone', name: 'Vintage Brass Gramophone', category: 'hearth' as const, cost: 280, icon: '🎺', description: 'Plays soothing acoustic waltzes and warm vinyl crackle.', comfortBonus: 30 },
  { id: 'grandfather_clock', name: 'Cedar Grandfather Clock', category: 'bedroom' as const, cost: 210, icon: '🕰️', description: 'Gentle rhythmic pendulum ticking soothingly.', comfortBonus: 22 },
  { id: 'brass_lamp', name: 'Ornate Bankers Lamp', category: 'hearth' as const, cost: 80, icon: '💡', description: 'Green glass shade casting soothing reading illumination.', comfortBonus: 10 },
];

// --- GALLERY OF HOMESTEAD PAINTINGS ---
export const HOUSE_PAINTINGS: HousePainting[] = [
  {
    id: 'amorsolo_rice',
    title: 'Planting Rice at Mount Mayon',
    artist: 'Fernando Amorsolo Homage',
    era: 'Classical Golden Sunlight',
    description: 'Bicol farmers rhythmically planting emerald rice shoots in golden morning light before the perfect cone of Mount Mayon.',
    icon: '🌾',
    previewGradient: 'from-amber-400 via-orange-500 to-emerald-700',
    frameStyle: 'carved_narra',
    comfortBonus: 35,
    cost: 150,
  },
  {
    id: 'mayon_sunset',
    title: 'Majestic Mayon Twilight',
    artist: 'Maestro Bicolano',
    era: 'Vibrant Impressionism',
    description: 'Dramatic violet and crimson sunset clouds crowning Mount Mayon, casting reflections across flooded palay terraces.',
    icon: '🌋',
    previewGradient: 'from-fuchsia-600 via-rose-500 to-indigo-900',
    frameStyle: 'gold_baroque',
    comfortBonus: 40,
    cost: 220,
  },
  {
    id: 'bicol_harana',
    title: 'Rural Moonlit Harana',
    artist: 'Naga Conservatory',
    era: 'Romantic Folk',
    description: 'Traditional acoustic guitar serenade under the moonlit veranda of a heritage Bahay na Bato, illuminated by capiz glow.',
    icon: '🎸',
    previewGradient: 'from-indigo-950 via-slate-800 to-amber-400',
    frameStyle: 'rustic_teak',
    comfortBonus: 30,
    cost: 180,
  },
  {
    id: 'kalabaw_dawn',
    title: 'Carabao in the Morning Mist',
    artist: 'Homestead Naturalist',
    era: 'Pastoral Realism',
    description: 'A loyal water buffalo resting peacefully beside river reed grasses while morning fog rolls across Naga Farm.',
    icon: '🐃',
    previewGradient: 'from-emerald-800 via-teal-700 to-amber-200',
    frameStyle: 'modern_brass',
    comfortBonus: 25,
    cost: 120,
  },
  {
    id: 'sunflower_granary',
    title: 'Sunflowers by the Timber Silo',
    artist: 'Post-Impressionist Master',
    era: 'Sunlit Impressionism',
    description: 'Vibrant golden sunflowers turning toward the noonday sun beside the rustic cedar storehouse.',
    icon: '🌻',
    previewGradient: 'from-yellow-400 via-amber-500 to-sky-600',
    frameStyle: 'gold_baroque',
    comfortBonus: 35,
    cost: 200,
  },
  {
    id: 'fluvial_parade',
    title: 'Naga River Fluvial Pagoda',
    artist: 'Camarines Sur Guild',
    era: 'Festival Baroque',
    description: 'Glowing candlelit pagoda barges floating down the tranquil Naga River during the sacred annual harvest feast.',
    icon: '⛵',
    previewGradient: 'from-amber-500 via-rose-600 to-blue-950',
    frameStyle: 'carved_narra',
    comfortBonus: 45,
    cost: 280,
  },
  {
    id: 'starry_valley',
    title: 'Starry Night Over Mount Isarog',
    artist: 'Celestial Expressionist',
    era: 'Modern Expressionism',
    description: 'Swirling luminous stars and fireflies dancing over the quiet pastures of Naga Farm.',
    icon: '✨',
    previewGradient: 'from-blue-950 via-indigo-900 to-cyan-500',
    frameStyle: 'gold_baroque',
    comfortBonus: 40,
    cost: 240,
  },
  {
    id: 'tropical_orchids',
    title: 'Rainforest Wild Vanda Orchids',
    artist: 'Botanical Explorer',
    era: 'Natural History Study',
    description: 'Detailed study of rare endemic purple and jade orchids blooming along ancient mountain mahogany trunks.',
    icon: '🌺',
    previewGradient: 'from-emerald-900 via-purple-700 to-pink-400',
    frameStyle: 'rustic_teak',
    comfortBonus: 28,
    cost: 140,
  },
];

// --- WALLPAPERS & INTERIOR WALL FINISHES ---
export const WALL_STYLES = [
  { id: 'cream_plaster', name: 'Warm Lime Plaster', desc: 'Hand-troweled rustic limestone finish with warm natural glow.', preview: '#fef3c7', pattern: 'plaster' },
  { id: 'capiz_lattice', name: 'Capiz Shell Lattice', desc: 'Mother-of-pearl squares encased in dark mahogany framing.', preview: '#f8fafc', pattern: 'lattice' },
  { id: 'sawali_bamboo', name: 'Sawali Bamboo Weave', desc: 'Handcrafted chevron woven bamboo strips with natural texture.', preview: '#d97706', pattern: 'sawali' },
  { id: 'vintage_rose', name: 'Pastoral Rosebud Floral', desc: 'Victorian floral wallpaper with delicate blush petals.', preview: '#fce7f3', pattern: 'floral' },
  { id: 'emerald_damask', name: 'Royal Emerald Damask', desc: 'Rich embossed damask textile wallpaper with gold flecks.', preview: '#064e3b', pattern: 'damask' },
  { id: 'terracotta_adobe', name: 'Sunbaked Terracotta', desc: 'Earthy warmth inspired by traditional Bicol clay pottery.', preview: '#9a3412', pattern: 'adobe' },
  { id: 'midnight_starlight', name: 'Midnight Celestial Navy', desc: 'Deep twilight indigo wall patterned with gold constellations.', preview: '#0f172a', pattern: 'stars' },
];

// --- FLOOR FINISHES ---
export const FLOOR_STYLES = [
  { id: 'hardwood_oak', name: 'Polished Narra Planks', desc: 'Rich amber-brown tropical hardwood with warm luster.', preview: '#78350f', pattern: 'planks' },
  { id: 'bamboo_parquet', name: 'Herringbone Bamboo', desc: 'Interlocking golden bamboo parquet tiles.', preview: '#b45309', pattern: 'herringbone' },
  { id: 'capiz_terrazzo', name: 'Capiz River Terrazzo', desc: 'Polished riverstone and crushed shell aggregate tiles.', preview: '#e2e8f0', pattern: 'stone' },
  { id: 'terracotta_tiles', name: 'Rustic Terracotta Tiles', desc: 'Handmade square clay tiles with sand mortar.', preview: '#c2410c', pattern: 'checker' },
  { id: 'checkered_bistro', name: 'Ivory & Onyx Checkered', desc: 'Classic French bistro polished marble checkerboard.', preview: '#1e293b', pattern: 'bistro' },
  { id: 'woven_banig', name: 'Pandan Woven Banig', desc: 'Traditional cooling woven pandan matting for floors.', preview: '#a16207', pattern: 'weave' },
];

// --- SIMS-STYLE FURNITURE SWATCHES ---
export const FURNITURE_SWATCHES = [
  { id: 'golden_teak', name: 'Golden Teak', hex: '#d97706', border: '#b45309', bgLight: '#fef3c7' },
  { id: 'dark_mahogany', name: 'Narra Mahogany', hex: '#7c2d12', border: '#451a03', bgLight: '#ffedd5' },
  { id: 'whitewash', name: 'Vintage Whitewash', hex: '#f8fafc', border: '#94a3b8', bgLight: '#ffffff' },
  { id: 'emerald_velvet', name: 'Emerald Velvet', hex: '#047857', border: '#064e3b', bgLight: '#d1fae5' },
  { id: 'midnight_navy', name: 'Midnight Navy', hex: '#1e3a8a', border: '#172554', bgLight: '#dbeafe' },
  { id: 'ruby_crimson', name: 'Ruby Crimson', hex: '#be123c', border: '#881337', bgLight: '#ffe4e6' },
  { id: 'natural_rattan', name: 'Natural Rattan', hex: '#ca8a04', border: '#854d0e', bgLight: '#fef9c3' },
  { id: 'charcoal_iron', name: 'Charcoal Iron', hex: '#334155', border: '#0f172a', bgLight: '#e2e8f0' },
];

export const HOUSE_LEVELS = [
  {
    level: 1,
    name: 'Cozy Bahay Kubo Cabin',
    upgradeCost: 0,
    gemCost: 0,
    maxFurniture: 6,
    perk: 'Traditional bamboo nipa hut with open studio layout and warm stone hearth.',
    minFarmLevel: 1,
  },
  {
    level: 2,
    name: '2-Storey Heritage Bahay na Bato',
    upgradeCost: 1800,
    gemCost: 20,
    maxFurniture: 12,
    perk: 'Sturdy 2-storey stone and mahogany estate with capiz shell windows and +15% crop sell value.',
    minFarmLevel: 10,
  },
  {
    level: 3,
    name: 'Modernized Farmhouse Villa',
    upgradeCost: 6500,
    gemCost: 45,
    maxFurniture: 18,
    perk: 'Sleek contemporary design with floor-to-ceiling glass, solar roof, and +25% experience bonus.',
    minFarmLevel: 20,
  },
  {
    level: 4,
    name: '3-Storey Luxury Estate with Garage',
    upgradeCost: 22000,
    gemCost: 90,
    maxFurniture: 26,
    perk: '3 spacious floors, covered garage with pickup truck, and +35% bonus coins on all town orders.',
    minFarmLevel: 35,
  },
  {
    level: 5,
    name: 'Sprawling Tropical Bungalow',
    upgradeCost: 60000,
    gemCost: 160,
    maxFurniture: 36,
    perk: 'Spacious single-level open floor plan, lanai veranda, and double harvest chance on all crops.',
    minFarmLevel: 50,
  },
  {
    level: 6,
    name: 'Grand Naga Hacienda Mansion',
    upgradeCost: 150000,
    gemCost: 350,
    maxFurniture: 50,
    perk: 'Palatial hacienda mansion with grand balcony, courtyard fountain, and permanent royal farm aura.',
    minFarmLevel: 100,
  },
];

export const KALABAW_UPGRADES = [
  {
    level: 1,
    name: 'Loyal Furrow Plow',
    cost: 0,
    coinsReq: 50000,
    minLevel: 20,
    radius: 3,
    shape: 'line',
    desc: 'Simultaneously plows 3 linear furrow plots in one swift motion.',
  },
  {
    level: 2,
    name: 'Reinforced Bronze Harness',
    cost: 15000,
    gems: 25,
    minLevel: 25,
    radius: 5,
    shape: 'line',
    desc: 'Expands plowing reach to 5 linear furrow plots simultaneously.',
  },
  {
    level: 3,
    name: 'Golden Master Yoke',
    cost: 35000,
    gems: 60,
    minLevel: 30,
    radius: 9,
    shape: 'square',
    desc: 'Supreme 3x3 square grid plow, cultivating 9 fields in a single thunderous charge!',
  },
];

export interface LevelUnlockInfo {
  level: number;
  title: string;
  badge: string;
  perks: Array<{ icon: string; name: string; instruction: string }>;
}

export const LEVEL_UNLOCK_ROADMAP: Record<number, LevelUnlockInfo> = {
  1: {
    level: 1,
    title: 'Welcome to Naga Farm!',
    badge: 'Starter Farmer',
    perks: [
      { icon: '⛏️', name: 'Field Limit: 3 Plots', instruction: 'You can maintain up to 3 plowed soil fields (3 per level stacked). Use the ⛏️ Plow tool to till grass.' },
      { icon: '🌱', name: 'Planting & Hydration', instruction: 'Select seeds from your bottom toolbar to plant into empty soil. Water them for 2x growth speed.' },
      { icon: '🏡', name: 'Homestead Studio', instruction: 'Tap your Bahay Kubo to enter the 3D room customizer and place comfortable furniture!' },
    ],
  },
  2: {
    level: 2,
    title: 'Sweet Harvests Ahead!',
    badge: 'Novice Planter',
    perks: [
      { icon: '⛏️', name: '+3 Field Plots (6 Total)', instruction: 'Your plow limit is stacked! You can now maintain up to 6 fields on the farm.' },
      { icon: '🍓', name: 'Sweet Strawberries Unlocked', instruction: 'Available in the Farm Shop! Yields ruby strawberries with chance of rare Sugar Heart Drops.' },
    ],
  },
  3: {
    level: 3,
    title: 'Poultry & Chickens Unlocked!',
    badge: 'Poultry Keeper',
    perks: [
      { icon: '🐔', name: 'Heritage Chicken Unlocked', instruction: 'Chickens unlock every 3rd level! Visit the Farm Shop > Livestock to adopt your first hen for fresh eggs.' },
      { icon: '⛏️', name: '+3 Field Plots (9 Total)', instruction: 'Your field capacity stacked to 9 plots.' },
      { icon: '🏡', name: 'Guest Cottage', instruction: 'New architectural blueprints available in the shop.' },
    ],
  },
  4: {
    level: 4,
    title: 'Golden Sweet Corn!',
    badge: 'Field Harvester',
    perks: [
      { icon: '🌽', name: 'Crisp Sweet Corn Seeds', instruction: 'Now purchasable in the Shop! Grows tall stalks producing golden cobs and rare Glass Gem variants.' },
      { icon: '⛏️', name: '+3 Field Plots (12 Total)', instruction: 'Plowing allowance expanded to 12 fields.' },
    ],
  },
  5: {
    level: 5,
    title: 'Auto Tech Automation Hub!',
    badge: 'Tech Pioneer',
    perks: [
      { icon: '⚙️', name: 'Auto Tech Hub Unlocked!', instruction: 'Tap the ⚙️ Auto Tech button on the HUD! Purchase automatic harvesters, seeders, sprinklers, and animal feeders to run your farm hands-free.' },
      { icon: '⛏️', name: '+3 Field Plots (15 Total)', instruction: 'Plow capacity stacked to 15 fields.' },
      { icon: '🥕', name: 'Crisp Carrots', instruction: 'Carrot seeds now available in the General Store.' },
    ],
  },
  6: {
    level: 6,
    title: 'Expanded Poultry Flock!',
    badge: 'Flock Tender',
    perks: [
      { icon: '🐔', name: '+1 Chicken Slot (2 Total)', instruction: 'Adopt another Heritage Chicken in the Farm Shop (every 3rd level).' },
      { icon: '⛏️', name: '+3 Field Plots (18 Total)', instruction: 'Maximum fields increased to 18.' },
    ],
  },
  7: {
    level: 7,
    title: 'Sunflowers & Honey!',
    badge: 'Sun Blossom',
    perks: [
      { icon: '🌻', name: 'Radiant Sunflowers', instruction: 'Bright blossoms now available in store. Attracts golden bees and yields Sunfire drops.' },
      { icon: '⛏️', name: '+3 Field Plots (21 Total)', instruction: 'Stack your field capacity to 21 plots.' },
    ],
  },
  8: {
    level: 8,
    title: 'Palaisdaan Aquaculture!',
    badge: 'Fisherman',
    perks: [
      { icon: '🐟', name: 'Palaisdaan Fish Pond Stock', instruction: 'Tap your fish pond to catch fresh Bangus (Milkfish) and River Tilapia with rare catches!' },
      { icon: '⛏️', name: '+3 Field Plots (24 Total)', instruction: 'Stack up to 24 field plots.' },
    ],
  },
  9: {
    level: 9,
    title: 'Master Poultry Flock!',
    badge: 'Poultry Master',
    perks: [
      { icon: '🐔', name: '+1 Chicken Slot (3 Total)', instruction: 'Another chicken slot unlocked in the shop (every 3rd level).' },
      { icon: '⛏️', name: '+3 Field Plots (27 Total)', instruction: 'Stack up to 27 fields across your homestead.' },
    ],
  },
  10: {
    level: 10,
    title: 'Kusina & 2-Storey House!',
    badge: 'Homestead Master',
    perks: [
      { icon: '🍳', name: 'Kusina Cookhouse Unlocked!', instruction: 'Tap 🍳 Kusina on the HUD! Cook delicious Filipino recipes (Sinigang, Adobo, Inihaw na Tilapia) for powerful coin & growth buffs with a 4s cooking simulation!' },
      { icon: '🏡', name: '2-Storey House Upgrade Available!', instruction: 'Visit Homestead > Architecture to upgrade to a 2-Storey Bahay na Bato with 12 furniture capacity and +15% crop value.' },
      { icon: '🐄', name: 'Jersey Dairy Cow Unlocked!', instruction: 'Cows unlock every 10 levels! Adopt your first dairy cow in the shop for rich milk.' },
      { icon: '⛏️', name: '+3 Field Plots (30 Total)', instruction: 'Plow capacity now stacked up to 30 fields.' },
    ],
  },
  15: {
    level: 15,
    title: 'Merino Sheep & Wool!',
    badge: 'Shepherd',
    perks: [
      { icon: '🐑', name: 'Merino Sheep Unlocked!', instruction: 'Sheep unlock every 5th tier (15, 25, 35...)! Adopt your first fluffy sheep in the shop for valuable wool and golden fleece.' },
      { icon: '🐔', name: '+1 Chicken Slot (5 Total)', instruction: 'More chickens available in the shop.' },
      { icon: '⛏️', name: '+3 Field Plots (45 Total)', instruction: 'Stack up to 45 fields on your farm.' },
    ],
  },
  20: {
    level: 20,
    title: 'Kalabaw & Modernized Villa!',
    badge: 'Agrarian Elite',
    perks: [
      { icon: '🐃', name: 'Kalabaw (Water Buffalo) Unlocked!', instruction: 'Available at Level 20 with 50,000 Coins! Select the 🐃 Kalabaw tool in the toolbar to plow multiple furrow plots simultaneously. Upgradable for wider radii!' },
      { icon: '🏡', name: 'Modernized House Upgrade Available!', instruction: 'Transform your home into a sleek Modern Farmhouse Villa with 18 furniture capacity and +25% experience bonus!' },
      { icon: '🐄', name: '+1 Cow Slot (2 Total)', instruction: 'Adopt another dairy cow in the shop (every 10th level).' },
      { icon: '⛏️', name: '+3 Field Plots (60 Total)', instruction: 'Stack up to 60 fields.' },
    ],
  },
  25: {
    level: 25,
    title: 'Master Shepherd!',
    badge: 'Wool Baron',
    perks: [
      { icon: '🐑', name: '+1 Sheep Slot (2 Total)', instruction: 'New sheep slot unlocked at level 25 (every 5th tier).' },
      { icon: '⛏️', name: '+3 Field Plots (75 Total)', instruction: 'Stack up to 75 fields.' },
    ],
  },
  30: {
    level: 30,
    title: 'Dairy Tycoon!',
    badge: 'Dairy Tycoon',
    perks: [
      { icon: '🐄', name: '+1 Cow Slot (3 Total)', instruction: 'New cow slot unlocked at level 30 (every 10th tier).' },
      { icon: '⛏️', name: '+3 Field Plots (90 Total)', instruction: 'Stack up to 90 fields.' },
    ],
  },
  35: {
    level: 35,
    title: '3-Storey House with Garage!',
    badge: 'Estate Patriarch',
    perks: [
      { icon: '🏡', name: '3-Storey House with Garage Upgrade!', instruction: 'Upgrade your home to a 3-storey luxury estate with private garage, 26 furniture slots, and +35% order bonuses!' },
      { icon: '🐑', name: '+1 Sheep Slot (3 Total)', instruction: 'New sheep slot unlocked at level 35.' },
      { icon: '⛏️', name: '+3 Field Plots (105 Total)', instruction: 'Plow capacity stacked to 105 plots.' },
    ],
  },
  50: {
    level: 50,
    title: 'Decent Bungalow Estate!',
    badge: 'Haciendero',
    perks: [
      { icon: '🏡', name: 'Decent Bungalow House Upgrade!', instruction: 'Upgrade to a sprawling luxury tropical bungalow with lanai veranda, 36 furniture capacity, and double harvest chance!' },
      { icon: '⛏️', name: '+3 Field Plots (150 Total)', instruction: 'Plow capacity stacked to 150 fields.' },
    ],
  },
  100: {
    level: 100,
    title: 'Grand Naga Hacienda Mansion!',
    badge: 'Legendary Hacienda Master',
    perks: [
      { icon: '🏰', name: 'Grand Mansion Upgrade!', instruction: 'The ultimate royal estate! 50 furniture slots, palatial courtyard fountain, and permanent royal farm boost!' },
      { icon: '⛏️', name: '+3 Field Plots (300 Total)', instruction: 'Cultivate up to 300 fields.' },
    ],
  },
};

export function getLevelUnlockInfo(level: number): LevelUnlockInfo {
  if (LEVEL_UNLOCK_ROADMAP[level]) {
    return LEVEL_UNLOCK_ROADMAP[level];
  }
  const perks = [
    {
      icon: '⛏️',
      name: `+3 Field Plots (${level * 3} Total)`,
      instruction: `Your plowing limit is stacked! You can now cultivate up to ${level * 3} fields across Naga Farm.`,
    },
  ];
  if (level % 3 === 0) {
    perks.push({
      icon: '🐔',
      name: `+1 Chicken Capacity (${Math.floor(level / 3)} Total)`,
      instruction: 'Chicken capacity expands every 3rd level! Visit the Farm Shop > Livestock to adopt another chicken.',
    });
  }
  if (level % 10 === 0) {
    perks.push({
      icon: '🐄',
      name: `+1 Dairy Cow Capacity (${Math.floor(level / 10)} Total)`,
      instruction: 'Cow capacity expands every 10th level! Visit the Farm Shop > Livestock to adopt another dairy cow.',
    });
  }
  if (level >= 15 && (level - 15) % 10 === 0) {
    perks.push({
      icon: '🐑',
      name: `+1 Merino Sheep Capacity (${1 + Math.floor((level - 15) / 10)} Total)`,
      instruction: 'Sheep capacity expands every 5th tier (15, 25, 35...)! Visit the Farm Shop > Livestock to adopt another sheep.',
    });
  }
  if (level >= 5 && level < 10) {
    perks.push({
      icon: '⚙️',
      name: 'Auto Tech Maintenance',
      instruction: 'Upgrade your auto-harvester, seed drill, or animal groomer in the Auto Tech Hub.',
    });
  }
  if (level >= 10) {
    perks.push({
      icon: '🍳',
      name: 'Kusina Recipes',
      instruction: 'Cook gourmet Filipino dishes with high coin & growth buffs in the Kusina Cookhouse.',
    });
  }
  return {
    level,
    title: `Level ${level} Master Planter!`,
    badge: `Level ${level} Farmer`,
    perks,
  };
}

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

// --- RARE, EPIC, AND LEGENDARY HARVEST DROP SYSTEM ---
export interface RareDropDef {
  itemKey: string;
  name: string;
  icon: string;
  rarity: ItemRarity;
  multiplier: number;
}

export const RARE_HARVEST_CATALOG: Record<string, { rare: RareDropDef; epic: RareDropDef; legendary: RareDropDef }> = {
  wheat: {
    rare: { itemKey: 'rare_plump_wheat', name: 'Plump Amber Wheat', icon: '🌾', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_shiny_wheat', name: 'Shiny Sunlit Wheat', icon: '✨', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_bushy_wheat', name: 'Bushy Wheat', icon: '👑', rarity: 'legendary', multiplier: 8.0 },
  },
  egg: {
    rare: { itemKey: 'rare_plump_egg', name: 'Speckled Farm Egg', icon: '🥚', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_shiny_egg', name: 'Shiny Egg', icon: '✨', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_golden_egg', name: 'Golden Egg', icon: '👑', rarity: 'legendary', multiplier: 10.0 },
  },
  strawberry: {
    rare: { itemKey: 'rare_sugar_strawberry', name: 'Sugar Heart Berry', icon: '🍓', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_ruby_strawberry', name: 'Ruby Jewel Strawberry', icon: '💎', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_starburst_strawberry', name: 'Starburst Strawberry', icon: '🌟', rarity: 'legendary', multiplier: 8.0 },
  },
  carrot: {
    rare: { itemKey: 'rare_golden_carrot', name: 'Crisp Golden Carrot', icon: '🥕', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_giant_carrot', name: 'Colossal King Carrot', icon: '🥕✨', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_aurora_carrot', name: 'Aurora Prismatic Carrot', icon: '🌈', rarity: 'legendary', multiplier: 8.0 },
  },
  corn: {
    rare: { itemKey: 'rare_rainbow_corn', name: 'Rainbow Kernel Corn', icon: '🌽', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_gem_corn', name: 'Glass Gem Indian Corn', icon: '💎', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_solar_corn', name: 'Sunburst Solar Corn', icon: '☀️', rarity: 'legendary', multiplier: 8.0 },
  },
  sunflower: {
    rare: { itemKey: 'rare_fire_sunflower', name: 'Sunfire Blossom', icon: '🌻', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_radiant_sunflower', name: 'Radiant Corona Blossom', icon: '✨', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_solar_sunflower', name: 'Celestial Sun Core', icon: '🌟', rarity: 'legendary', multiplier: 8.0 },
  },
  pumpkin: {
    rare: { itemKey: 'rare_sugar_pumpkin', name: 'Cinnamon Sugar Pumpkin', icon: '🎃', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_giant_pumpkin', name: 'Colossal Giant Pumpkin', icon: '🎃✨', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_mythic_pumpkin', name: 'Mythic Cinder Pumpkin', icon: '👑', rarity: 'legendary', multiplier: 10.0 },
  },
  frostberry: {
    rare: { itemKey: 'rare_glacier_berry', name: 'Glacier Ice Berry', icon: '🫐', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_aurora_berry', name: 'Boreal Aurora Berry', icon: '🌌', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_starlight_berry', name: 'Starlight Frozen Berry', icon: '❄️👑', rarity: 'legendary', multiplier: 8.0 },
  },
  palay: {
    rare: { itemKey: 'rare_jasmine_palay', name: 'Fragrant Jasmine Palay', icon: '🌾', rarity: 'rare', multiplier: 2.2 },
    epic: { itemKey: 'epic_pearl_palay', name: 'Pearl White Heirloom Palay', icon: '🦪', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_imperial_palay', name: 'Imperial Golden Palay', icon: '🌾👑', rarity: 'legendary', multiplier: 10.0 },
  },
  ube: {
    rare: { itemKey: 'rare_royal_ube', name: 'Royal Bohol Ube', icon: '🍠', rarity: 'rare', multiplier: 2.2 },
    epic: { itemKey: 'epic_velvet_ube', name: 'Velvet Crown Deep Ube', icon: '👑', rarity: 'epic', multiplier: 4.5 },
    legendary: { itemKey: 'legendary_celestial_ube', name: 'Celestial Amethyst Ube', icon: '💎', rarity: 'legendary', multiplier: 10.0 },
  },
  mango: {
    rare: { itemKey: 'rare_honey_mango', name: 'Honey Nectar Mango', icon: '🥭', rarity: 'rare', multiplier: 2.2 },
    epic: { itemKey: 'epic_royal_mango', name: 'Royal Sunburst Mango', icon: '🌟', rarity: 'epic', multiplier: 4.5 },
    legendary: { itemKey: 'legendary_divine_mango', name: 'Divine Golden Mango', icon: '🥭👑', rarity: 'legendary', multiplier: 10.0 },
  },
  milk: {
    rare: { itemKey: 'rare_cream_milk', name: 'Cream Top Rich Milk', icon: '🥛', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_clotted_milk', name: 'Golden Clotted Milk', icon: '🥛✨', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_carabao_nectar', name: 'Mythic Carabao Nectar Milk', icon: '🥛👑', rarity: 'legendary', multiplier: 8.0 },
  },
  wool: {
    rare: { itemKey: 'rare_silk_wool', name: 'Silk Merino Fleece', icon: '🧶', rarity: 'rare', multiplier: 2.0 },
    epic: { itemKey: 'epic_rainbow_wool', name: 'Prismatic Spun Wool', icon: '🌈', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_golden_fleece', name: 'Golden Fleece of Legend', icon: '🧶👑', rarity: 'legendary', multiplier: 8.0 },
  },
  ostrich_egg: {
    rare: { itemKey: 'rare_spotted_ostrich_egg', name: 'Speckled Giant Ostrich Egg', icon: '🪺', rarity: 'rare', multiplier: 2.2 },
    epic: { itemKey: 'epic_marble_ostrich_egg', name: 'Marble Ostrich Egg', icon: '🪨✨', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_prismatic_ostrich_egg', name: 'Prismatic Gem Ostrich Egg', icon: '🪺👑', rarity: 'legendary', multiplier: 10.0 },
  },
  rabbit_wool: {
    rare: { itemKey: 'rare_angora_fur', name: 'Fluffy Angora Fur', icon: '🐇', rarity: 'rare', multiplier: 2.2 },
    epic: { itemKey: 'epic_velvet_angora', name: 'Velvet Royal Angora', icon: '🧶✨', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_starlight_angora', name: 'Golden Starlight Angora', icon: '🌟👑', rarity: 'legendary', multiplier: 10.0 },
  },
  tilapia: {
    rare: { itemKey: 'rare_golden_tilapia', name: 'Golden River Tilapia', icon: '🐟', rarity: 'rare', multiplier: 2.2 },
    epic: { itemKey: 'epic_emerald_tilapia', name: 'Emerald Lake Tilapia', icon: '🐠✨', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_diamond_tilapia', name: 'Diamond Crown Tilapia', icon: '💎👑', rarity: 'legendary', multiplier: 10.0 },
  },
  milkfish: {
    rare: { itemKey: 'rare_silver_bangus', name: 'Giant Dagupan Bangus', icon: '🐟', rarity: 'rare', multiplier: 2.2 },
    epic: { itemKey: 'epic_king_bangus', name: 'Silver King Bangus', icon: '👑', rarity: 'epic', multiplier: 4.0 },
    legendary: { itemKey: 'legendary_dragon_bangus', name: 'Imperial Dragon Bangus', icon: '🐉👑', rarity: 'legendary', multiplier: 10.0 },
  },
};

export function getRareHarvestDrop(
  baseKey: string,
  extraRareBuff = false
): { itemKey: string; name: string; icon: string; rarity: ItemRarity; multiplier: number } | null {
  const entry = RARE_HARVEST_CATALOG[baseKey];
  if (!entry) return null;

  const roll = Math.random();
  const buffModifier = extraRareBuff ? 1.6 : 1.0;

  // 3% Legendary chance (buffed: 4.8%)
  if (roll < 0.03 * buffModifier) {
    return entry.legendary;
  }
  // 7% Epic chance (buffed: 11.2%)
  if (roll < 0.1 * buffModifier) {
    return entry.epic;
  }
  // 15% Rare chance (buffed: 24%)
  if (roll < 0.25 * buffModifier) {
    return entry.rare;
  }

  return null;
}

// --- RECIPE-BASED COOKING SIMULATION CATALOG ---
export const COOKING_RECIPES: CookingRecipe[] = [
  {
    id: 'recipe_sinigang_bangus',
    name: 'Sinigang na Bangus',
    filipinoName: 'Sour Tamarind Fish Stew',
    category: 'main',
    icon: '🍲',
    description: 'Iconic Filipino sour tamarind broth with tender milkfish and golden palay rice.',
    ingredients: [
      { itemKey: 'milkfish', itemName: 'Bangus (Milkfish)', count: 1, icon: '🐟' },
      { itemKey: 'palay', itemName: 'Golden Palay', count: 1, icon: '🌾' },
    ],
    cookTimeSec: 3,
    sellValue: 240,
    buffDescription: '+35% Crop Growth Speed for 3 minutes!',
    buffType: 'growth_speed',
    buffDurationSec: 180,
  },
  {
    id: 'recipe_inihaw_tilapia',
    name: 'Inihaw na Tilapia & Rice',
    filipinoName: 'Charcoal Grilled River Tilapia',
    category: 'main',
    icon: '🐟',
    description: 'Charcoal grilled stuffed tilapia served on banana leaf with steaming hot rice.',
    ingredients: [
      { itemKey: 'tilapia', itemName: 'Fresh Tilapia', count: 1, icon: '🐟' },
      { itemKey: 'palay', itemName: 'Golden Palay', count: 1, icon: '🌾' },
    ],
    cookTimeSec: 3,
    sellValue: 200,
    buffDescription: '+25% Extra Coins on all harvests for 3 minutes!',
    buffType: 'coin_boost',
    buffDurationSec: 180,
  },
  {
    id: 'recipe_ube_halaya',
    name: 'Ube Halaya Jam',
    filipinoName: 'Sweet Purple Yam Jam',
    category: 'dessert',
    icon: '🍠',
    description: 'Slow-stirred creamy purple yam jam with sweet milk and latik curd.',
    ingredients: [
      { itemKey: 'ube', itemName: 'Purple Yam', count: 2, icon: '🍠' },
      { itemKey: 'milk', itemName: 'Farm Milk', count: 1, icon: '🥛' },
    ],
    cookTimeSec: 4,
    sellValue: 280,
    buffDescription: 'Double Harvest Chance on next crops for 3 minutes!',
    buffType: 'double_harvest',
    buffDurationSec: 180,
  },
  {
    id: 'recipe_mango_float',
    name: 'Carabao Mango Float',
    filipinoName: 'Graham Mango Icebox Cake',
    category: 'dessert',
    icon: '🥭',
    description: 'Layers of sweet ripe carabao mango, cream, and crunchy graham crust.',
    ingredients: [
      { itemKey: 'mango', itemName: 'Carabao Mango', count: 2, icon: '🥭' },
      { itemKey: 'milk', itemName: 'Farm Milk', count: 1, icon: '🥛' },
    ],
    cookTimeSec: 3,
    sellValue: 310,
    buffDescription: '+50% Extra XP on all farm activities for 3 minutes!',
    buffType: 'xp_boost',
    buffDurationSec: 180,
  },
  {
    id: 'recipe_ostrich_omelette',
    name: 'Royal Ostrich Omelette',
    filipinoName: 'Giant Farm Omelette',
    category: 'breakfast',
    icon: '🍳',
    description: 'Massive fluffy golden omelette prepared from a fresh giant ostrich egg and crisp carrots.',
    ingredients: [
      { itemKey: 'ostrich_egg', itemName: 'Ostrich Egg', count: 1, icon: '🪺' },
      { itemKey: 'carrot', itemName: 'Crisp Carrot', count: 1, icon: '🥕' },
    ],
    cookTimeSec: 4,
    sellValue: 360,
    buffDescription: '+35% Crop Growth Speed & +25% Coins for 3 minutes!',
    buffType: 'growth_speed',
    buffDurationSec: 180,
  },
  {
    id: 'recipe_rustic_bread',
    name: 'Artisan Farm Bread',
    filipinoName: 'Fresh Baked Sourdough',
    category: 'breakfast',
    icon: '🍞',
    description: 'Warm crusty loaf baked from freshly stone-milled golden wheat.',
    ingredients: [
      { itemKey: 'wheat', itemName: 'Golden Wheat', count: 2, icon: '🌾' },
      { itemKey: 'milk', itemName: 'Farm Milk', count: 1, icon: '🥛' },
    ],
    cookTimeSec: 2,
    sellValue: 120,
    buffDescription: '+20% Extra XP for 2 minutes!',
    buffType: 'xp_boost',
    buffDurationSec: 120,
  },
  {
    id: 'recipe_berry_pancake',
    name: 'Strawberry Cloud Pancakes',
    filipinoName: 'Berry Fluffy Hotcakes',
    category: 'breakfast',
    icon: '🥞',
    description: 'Tower of fluffy buttermilk pancakes topped with sweet strawberries.',
    ingredients: [
      { itemKey: 'strawberry', itemName: 'Sweet Strawberry', count: 2, icon: '🍓' },
      { itemKey: 'wheat', itemName: 'Golden Wheat', count: 1, icon: '🌾' },
      { itemKey: 'egg', itemName: 'Farm Egg', count: 1, icon: '🥚' },
    ],
    cookTimeSec: 3,
    sellValue: 220,
    buffDescription: '+30% Coin Boost for 3 minutes!',
    buffType: 'coin_boost',
    buffDurationSec: 180,
  },
  {
    id: 'recipe_pastillas',
    name: 'Carabao Milk Pastillas',
    filipinoName: 'Pastillas de Leche',
    category: 'dessert',
    icon: '🍬',
    description: 'Hand-rolled milk candies made from creamy fresh Carabao milk wrapped in papel de hapon.',
    ingredients: [
      { itemKey: 'milk', itemName: 'Carabao Milk', count: 2, icon: '🥛' },
      { itemKey: 'wheat', itemName: 'Golden Wheat', count: 1, icon: '🌾' },
    ],
    cookTimeSec: 2,
    sellValue: 250,
    buffDescription: 'Double Harvest Chance on next crops for 3 minutes!',
    buffType: 'double_harvest',
    buffDurationSec: 180,
  },
  {
    id: 'recipe_pumpkin_soup',
    name: 'Roasted Pumpkin Soup',
    filipinoName: 'Creamy Squash Stew',
    category: 'main',
    icon: '🥣',
    description: 'Comforting autumn pumpkin soup blended with farm cream and roasted spices.',
    ingredients: [
      { itemKey: 'pumpkin', itemName: 'Spiced Pumpkin', count: 1, icon: '🎃' },
      { itemKey: 'carrot', itemName: 'Crisp Carrot', count: 1, icon: '🥕' },
      { itemKey: 'milk', itemName: 'Farm Milk', count: 1, icon: '🥛' },
    ],
    cookTimeSec: 3,
    sellValue: 290,
    buffDescription: '+30% Crop Growth Speed for 3 minutes!',
    buffType: 'growth_speed',
    buffDurationSec: 180,
  },
  {
    id: 'recipe_legendary_fiesta',
    name: 'Grand Naga Fiesta Feast',
    filipinoName: 'Bicolandia Royal Platter',
    category: 'main',
    icon: '🍱',
    description: 'The ultimate harvest festival platter with golden palay, bangus, ube halaya, and mango.',
    ingredients: [
      { itemKey: 'palay', itemName: 'Golden Palay', count: 2, icon: '🌾' },
      { itemKey: 'milkfish', itemName: 'Bangus (Milkfish)', count: 1, icon: '🐟' },
      { itemKey: 'ube', itemName: 'Purple Yam', count: 1, icon: '🍠' },
      { itemKey: 'mango', itemName: 'Carabao Mango', count: 1, icon: '🥭' },
    ],
    cookTimeSec: 5,
    sellValue: 750,
    buffDescription: 'All Buffs Active: Double Harvest, 2x Coins & 2x Speed for 5 minutes!',
    buffType: 'double_harvest',
    buffDurationSec: 300,
  },
];

// --- BARN UPGRADE CATALOG ---
export const BARN_UPGRADES = [
  { level: 1, name: 'Rustic Granary', capacity: 100, cost: 0, icon: '🛖', description: 'Cozy timber granary for basic harvests.' },
  { level: 2, name: 'Extended Storehouse', capacity: 300, cost: 450, icon: '🏛️', description: 'Reinforced cedar storehouse with cooling racks for rare harvests.' },
  { level: 3, name: 'Grand Agricultural Silo', capacity: 800, cost: 1100, icon: '🏰', description: 'Massive automated grain silo with climate control & quality preservation.' },
];

// --- LAND EXPANSIONS ---
export const LAND_EXPANSIONS = [
  {
    expansion: 1,
    targetGridSize: 14,
    name: 'River Valley Acreage',
    cost: 550,
    gems: 10,
    minHouseLevel: 2,
    minBarnLevel: 2,
    description: 'Clears overgrown brush toward the riverbank, expanding Naga Farm from 12x12 to 14x14!',
  },
  {
    expansion: 2,
    targetGridSize: 16,
    name: 'Mayon Foothills Territory',
    cost: 1200,
    gems: 25,
    minHouseLevel: 3,
    minBarnLevel: 2,
    description: 'Incorporates fertile volcanic soil plots, expanding Naga Farm from 14x14 to 16x16!',
  },
];

// Expands grid tiles preserving existing structures and scattering fertile soil & decor in new bounds
export function expandGridTiles(currentTiles: FarmTile[], oldGridSize: number, newGridSize: number): FarmTile[] {
  const map = new Map<string, FarmTile>();
  currentTiles.forEach((t) => map.set(`${t.x},${t.y}`, t));

  const expanded: FarmTile[] = [];

  for (let x = 0; x < newGridSize; x++) {
    for (let y = 0; y < newGridSize; y++) {
      const key = `${x},${y}`;
      if (map.has(key)) {
        expanded.push(map.get(key)!);
      } else {
        // Newly cleared land
        let type: FarmTile['type'] = 'grass';
        let decor: FarmTile['decor'] = undefined;

        // Occasional wild wildflower bed or trees on borders
        if ((x === newGridSize - 1 || y === newGridSize - 1) && (x + y) % 3 === 0) {
          type = 'flower_bed';
        } else if ((x === newGridSize - 2 && y % 4 === 1) || (y === newGridSize - 2 && x % 4 === 2)) {
          decor = { id: `decor_cherry_${x}_${y}`, type: 'cherry_tree' };
        }

        expanded.push({ x, y, type, decor });
      }
    }
  }

  return expanded;
}


