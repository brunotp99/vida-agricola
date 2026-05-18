export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  subcategory: string
  brand: string
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount: number
  weight?: string
  sku: string
  tags: string[]
  specifications: Record<string, string>
  featured?: boolean
  newArrival?: boolean
  bestSeller?: boolean
  flashDeal?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  icon: string
  subcategories: Subcategory[]
  featured?: boolean
}

export interface Subcategory {
  id: string
  name: string
  slug: string
  image?: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string
  description?: string
}

export const categories: Category[] = [
  {
    id: 'animal-feed',
    name: 'Animal Feed',
    slug: 'animal-feed',
    description: 'Premium quality feed for all your livestock',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400',
    icon: 'Wheat',
    featured: true,
    subcategories: [
      { id: 'poultry-feed', name: 'Poultry Feed', slug: 'poultry-feed' },
      { id: 'cattle-feed', name: 'Cattle Feed', slug: 'cattle-feed' },
      { id: 'pig-feed', name: 'Pig Feed', slug: 'pig-feed' },
      { id: 'horse-feed', name: 'Horse Feed', slug: 'horse-feed' },
      { id: 'fish-feed', name: 'Fish Feed', slug: 'fish-feed' },
      { id: 'organic-feed', name: 'Organic Feed', slug: 'organic-feed' },
    ],
  },
  {
    id: 'farm-equipment',
    name: 'Farm Equipment',
    slug: 'farm-equipment',
    description: 'Essential equipment for modern farming',
    image: 'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=400',
    icon: 'Tractor',
    featured: true,
    subcategories: [
      { id: 'feeders', name: 'Feeders', slug: 'feeders' },
      { id: 'drinkers', name: 'Drinkers', slug: 'drinkers' },
      { id: 'incubators', name: 'Incubators', slug: 'incubators' },
      { id: 'generators', name: 'Generators', slug: 'generators' },
      { id: 'water-pumps', name: 'Water Pumps', slug: 'water-pumps' },
      { id: 'sprayers', name: 'Sprayers', slug: 'sprayers' },
    ],
  },
  {
    id: 'veterinary-health',
    name: 'Veterinary & Health',
    slug: 'veterinary-health',
    description: 'Healthcare products for animal wellness',
    image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400',
    icon: 'Heart',
    featured: true,
    subcategories: [
      { id: 'vaccines', name: 'Vaccines', slug: 'vaccines' },
      { id: 'vitamins', name: 'Vitamins', slug: 'vitamins' },
      { id: 'antibiotics', name: 'Antibiotics', slug: 'antibiotics' },
      { id: 'supplements', name: 'Supplements', slug: 'supplements' },
      { id: 'hygiene', name: 'Hygiene Products', slug: 'hygiene' },
    ],
  },
  {
    id: 'clothing-safety',
    name: 'Clothing & Safety',
    slug: 'clothing-safety',
    description: 'Protective gear for farm workers',
    image: 'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=400',
    icon: 'HardHat',
    subcategories: [
      { id: 'boots', name: 'Boots', slug: 'boots' },
      { id: 'gloves', name: 'Gloves', slug: 'gloves' },
      { id: 'jackets', name: 'Jackets', slug: 'jackets' },
      { id: 'waterproof', name: 'Waterproof Clothing', slug: 'waterproof' },
      { id: 'protective', name: 'Protective Equipment', slug: 'protective' },
    ],
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'Seeds, fertilizers, and cultivation supplies',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    icon: 'Leaf',
    featured: true,
    subcategories: [
      { id: 'seeds', name: 'Seeds', slug: 'seeds' },
      { id: 'fertilizers', name: 'Fertilizers', slug: 'fertilizers' },
      { id: 'irrigation', name: 'Irrigation', slug: 'irrigation' },
      { id: 'fencing', name: 'Fencing', slug: 'fencing' },
      { id: 'hand-tools', name: 'Hand Tools', slug: 'hand-tools' },
    ],
  },
  {
    id: 'poultry-equipment',
    name: 'Poultry Equipment',
    slug: 'poultry-equipment',
    description: 'Specialized equipment for poultry farming',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
    icon: 'Bird',
    subcategories: [
      { id: 'egg-incubators', name: 'Egg Incubators', slug: 'egg-incubators' },
      { id: 'brooders', name: 'Brooders', slug: 'brooders' },
      { id: 'poultry-cages', name: 'Poultry Cages', slug: 'poultry-cages' },
      { id: 'egg-trays', name: 'Egg Trays', slug: 'egg-trays' },
      { id: 'lighting', name: 'Lighting Systems', slug: 'lighting' },
    ],
  },
]

export const brands: Brand[] = [
  { id: 'purina', name: 'Purina', slug: 'purina', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100' },
  { id: 'cargill', name: 'Cargill', slug: 'cargill', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100' },
  { id: 'nutrena', name: 'Nutrena', slug: 'nutrena', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100' },
  { id: 'land-o-lakes', name: "Land O'Lakes", slug: 'land-o-lakes', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100' },
  { id: 'john-deere', name: 'John Deere', slug: 'john-deere', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100' },
  { id: 'stihl', name: 'Stihl', slug: 'stihl', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100' },
  { id: 'agri-fab', name: 'Agri-Fab', slug: 'agri-fab', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100' },
  { id: 'farm-innovators', name: 'Farm Innovators', slug: 'farm-innovators', logo: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100' },
]

export const products: Product[] = [
  // Animal Feed Products
  {
    id: 'prod-001',
    name: 'Premium Layer Chicken Feed 25kg',
    slug: 'premium-layer-chicken-feed-25kg',
    description: 'High-quality layer feed formulated for optimal egg production. Contains essential vitamins, minerals, and proteins for healthy laying hens. Promotes strong eggshells and consistent laying patterns.',
    price: 32.99,
    originalPrice: 38.99,
    images: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600',
    ],
    category: 'animal-feed',
    subcategory: 'poultry-feed',
    brand: 'Purina',
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    stockCount: 150,
    weight: '25kg',
    sku: 'PLF-25KG-001',
    tags: ['poultry', 'layer feed', 'chicken', 'organic'],
    specifications: {
      'Protein Content': '16%',
      'Fat Content': '3.5%',
      'Fiber Content': '5%',
      'Calcium': '3.8%',
    },
    featured: true,
    bestSeller: true,
  },
  {
    id: 'prod-002',
    name: 'Organic Cattle Feed Mix 50kg',
    slug: 'organic-cattle-feed-mix-50kg',
    description: 'Premium organic cattle feed blend with natural grains and supplements. Promotes healthy weight gain and milk production. Free from artificial additives and growth hormones.',
    price: 54.99,
    images: [
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600',
    ],
    category: 'animal-feed',
    subcategory: 'cattle-feed',
    brand: 'Cargill',
    rating: 4.6,
    reviewCount: 189,
    inStock: true,
    stockCount: 75,
    weight: '50kg',
    sku: 'OCF-50KG-002',
    tags: ['cattle', 'organic', 'dairy', 'beef'],
    specifications: {
      'Protein Content': '14%',
      'Fat Content': '4%',
      'Fiber Content': '12%',
      'Energy': '2.8 MCal/kg',
    },
    featured: true,
  },
  {
    id: 'prod-003',
    name: 'Starter Chick Feed 10kg',
    slug: 'starter-chick-feed-10kg',
    description: 'Specially formulated starter feed for chicks up to 6 weeks old. High protein content for rapid growth and strong development. Contains essential amino acids and vitamins.',
    price: 18.99,
    originalPrice: 22.99,
    images: [
      'https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=600',
    ],
    category: 'animal-feed',
    subcategory: 'poultry-feed',
    brand: 'Nutrena',
    rating: 4.9,
    reviewCount: 312,
    inStock: true,
    stockCount: 200,
    weight: '10kg',
    sku: 'SCF-10KG-003',
    tags: ['chicks', 'starter', 'poultry', 'growth'],
    specifications: {
      'Protein Content': '20%',
      'Fat Content': '3%',
      'Fiber Content': '4%',
      'Medication': 'Coccidiostat included',
    },
    newArrival: true,
    bestSeller: true,
  },
  // Farm Equipment
  {
    id: 'prod-004',
    name: 'Automatic Egg Incubator 120 Eggs',
    slug: 'automatic-egg-incubator-120-eggs',
    description: 'Professional-grade automatic egg incubator with digital temperature and humidity control. Features automatic egg turning, LED display, and alarm system. Perfect for small to medium poultry farms.',
    price: 189.99,
    originalPrice: 229.99,
    images: [
      'https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=600',
    ],
    category: 'farm-equipment',
    subcategory: 'incubators',
    brand: 'Farm Innovators',
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    stockCount: 25,
    sku: 'AEI-120-004',
    tags: ['incubator', 'eggs', 'automatic', 'poultry'],
    specifications: {
      'Capacity': '120 eggs',
      'Temperature Range': '30-40°C',
      'Humidity Range': '40-75%',
      'Power': '80W',
      'Voltage': '220V',
    },
    featured: true,
    flashDeal: true,
  },
  {
    id: 'prod-005',
    name: 'Heavy Duty Water Pump 1.5HP',
    slug: 'heavy-duty-water-pump-1-5hp',
    description: 'Industrial-grade water pump for farm irrigation and water supply systems. High flow rate with durable construction. Suitable for deep wells and long-distance water transfer.',
    price: 249.99,
    images: [
      'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=600',
    ],
    category: 'farm-equipment',
    subcategory: 'water-pumps',
    brand: 'John Deere',
    rating: 4.5,
    reviewCount: 98,
    inStock: true,
    stockCount: 15,
    sku: 'WP-15HP-005',
    tags: ['pump', 'water', 'irrigation', 'heavy-duty'],
    specifications: {
      'Power': '1.5 HP',
      'Flow Rate': '200 L/min',
      'Max Head': '45m',
      'Inlet/Outlet': '2 inch',
    },
  },
  {
    id: 'prod-006',
    name: 'Automatic Chicken Feeder 20kg Capacity',
    slug: 'automatic-chicken-feeder-20kg',
    description: 'Large capacity automatic chicken feeder with rain cover and anti-waste design. Gravity-fed system ensures constant feed availability. Durable galvanized steel construction.',
    price: 45.99,
    images: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600',
    ],
    category: 'farm-equipment',
    subcategory: 'feeders',
    brand: 'Agri-Fab',
    rating: 4.4,
    reviewCount: 267,
    inStock: true,
    stockCount: 80,
    sku: 'ACF-20KG-006',
    tags: ['feeder', 'chicken', 'automatic', 'galvanized'],
    specifications: {
      'Capacity': '20kg',
      'Material': 'Galvanized Steel',
      'Dimensions': '45 x 35 x 60 cm',
      'Suitable For': 'Up to 30 chickens',
    },
    bestSeller: true,
  },
  // Veterinary Products
  {
    id: 'prod-007',
    name: 'Poultry Vitamin Complex 500ml',
    slug: 'poultry-vitamin-complex-500ml',
    description: 'Comprehensive vitamin supplement for poultry. Contains vitamins A, D3, E, K3, and B-complex. Improves immunity, growth rate, and egg production. Easy water-soluble formula.',
    price: 24.99,
    originalPrice: 29.99,
    images: [
      'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600',
    ],
    category: 'veterinary-health',
    subcategory: 'vitamins',
    brand: "Land O'Lakes",
    rating: 4.8,
    reviewCount: 445,
    inStock: true,
    stockCount: 120,
    weight: '500ml',
    sku: 'PVC-500ML-007',
    tags: ['vitamins', 'poultry', 'supplements', 'immunity'],
    specifications: {
      'Volume': '500ml',
      'Dosage': '1ml per liter of water',
      'Shelf Life': '24 months',
      'Storage': 'Cool, dry place',
    },
    featured: true,
    newArrival: true,
  },
  {
    id: 'prod-008',
    name: 'Livestock Calcium Supplement 5kg',
    slug: 'livestock-calcium-supplement-5kg',
    description: 'Premium calcium supplement for dairy cattle and laying hens. Prevents calcium deficiency, improves milk production and eggshell quality. Easy to mix with regular feed.',
    price: 19.99,
    images: [
      'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600',
    ],
    category: 'veterinary-health',
    subcategory: 'supplements',
    brand: 'Cargill',
    rating: 4.6,
    reviewCount: 178,
    inStock: true,
    stockCount: 95,
    weight: '5kg',
    sku: 'LCS-5KG-008',
    tags: ['calcium', 'supplements', 'dairy', 'poultry'],
    specifications: {
      'Calcium Content': '38%',
      'Phosphorus': '0.02%',
      'Dosage': '20-30g per animal/day',
      'Form': 'Fine powder',
    },
  },
  // Clothing & Safety
  {
    id: 'prod-009',
    name: 'Professional Rubber Farm Boots',
    slug: 'professional-rubber-farm-boots',
    description: 'Durable rubber farm boots with steel toe protection. Waterproof, chemical-resistant, and easy to clean. Comfortable cushioned insole for all-day wear. Available in various sizes.',
    price: 59.99,
    originalPrice: 74.99,
    images: [
      'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600',
    ],
    category: 'clothing-safety',
    subcategory: 'boots',
    brand: 'Stihl',
    rating: 4.7,
    reviewCount: 523,
    inStock: true,
    stockCount: 200,
    sku: 'RFB-PRO-009',
    tags: ['boots', 'safety', 'waterproof', 'steel-toe'],
    specifications: {
      'Material': 'Natural Rubber',
      'Toe Protection': 'Steel Toe',
      'Height': '38cm',
      'Sole': 'Slip-resistant',
    },
    featured: true,
    bestSeller: true,
  },
  {
    id: 'prod-010',
    name: 'Heavy Duty Leather Work Gloves',
    slug: 'heavy-duty-leather-work-gloves',
    description: 'Premium cowhide leather work gloves for farm and construction work. Reinforced palm and fingertips for extended durability. Breathable design with adjustable wrist strap.',
    price: 18.99,
    images: [
      'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600',
    ],
    category: 'clothing-safety',
    subcategory: 'gloves',
    brand: 'Stihl',
    rating: 4.5,
    reviewCount: 892,
    inStock: true,
    stockCount: 350,
    sku: 'LWG-HD-010',
    tags: ['gloves', 'leather', 'work', 'protective'],
    specifications: {
      'Material': 'Cowhide Leather',
      'Lining': 'Cotton',
      'Cuff': 'Adjustable strap',
      'Size Range': 'M, L, XL',
    },
    newArrival: true,
  },
  // Agriculture
  {
    id: 'prod-011',
    name: 'Hybrid Tomato Seeds Pack',
    slug: 'hybrid-tomato-seeds-pack',
    description: 'High-yield hybrid tomato seeds with disease resistance. Produces large, flavorful tomatoes in 70-80 days. Suitable for both open field and greenhouse cultivation.',
    price: 8.99,
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    ],
    category: 'agriculture',
    subcategory: 'seeds',
    brand: 'Agri-Fab',
    rating: 4.4,
    reviewCount: 234,
    inStock: true,
    stockCount: 500,
    weight: '50g',
    sku: 'HTS-50G-011',
    tags: ['seeds', 'tomato', 'hybrid', 'vegetable'],
    specifications: {
      'Seed Count': 'Approx. 500 seeds',
      'Germination Rate': '95%+',
      'Days to Maturity': '70-80 days',
      'Fruit Size': '150-200g',
    },
  },
  {
    id: 'prod-012',
    name: 'Organic NPK Fertilizer 25kg',
    slug: 'organic-npk-fertilizer-25kg',
    description: 'Balanced organic NPK fertilizer for all crops. Slow-release formula provides sustained nutrition throughout the growing season. Improves soil structure and promotes healthy root development.',
    price: 34.99,
    originalPrice: 42.99,
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    ],
    category: 'agriculture',
    subcategory: 'fertilizers',
    brand: 'Cargill',
    rating: 4.7,
    reviewCount: 567,
    inStock: true,
    stockCount: 180,
    weight: '25kg',
    sku: 'ONF-25KG-012',
    tags: ['fertilizer', 'organic', 'NPK', 'soil'],
    specifications: {
      'N-P-K Ratio': '10-10-10',
      'Organic Matter': '40%',
      'Application Rate': '200-300g per m²',
      'Suitable For': 'All crops',
    },
    flashDeal: true,
  },
]

export const testimonials = [
  {
    id: '1',
    name: 'Carlos Rodriguez',
    role: 'Poultry Farmer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    content: 'Vida Agrícola has transformed my farm operations. The quality of their feed products is exceptional, and my egg production has increased by 30% since switching to their premium layer feed.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Maria Santos',
    role: 'Dairy Farm Owner',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    content: 'The customer service is outstanding! They helped me choose the right supplements for my cattle, and the delivery was prompt. I highly recommend Vida Agrícola to all farmers.',
    rating: 5,
  },
  {
    id: '3',
    name: 'João Silva',
    role: 'Small-Scale Farmer',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    content: 'Excellent prices and top-notch quality. I\'ve been buying from Vida Agrícola for 3 years now, and they never disappoint. Their equipment is durable and worth every penny.',
    rating: 5,
  },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function calculateDiscount(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}
