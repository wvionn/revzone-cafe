// 1. ENCAPSULATION: Data dibungkus dalam Class
// Properti dibuat private, akses lewat getter.
// Logic visual (warna tag) disembunyikan di dalam class ini.
export type SizeOption = { id: string; label: string; priceDelta: number };
export type AddonOption = { id: string; label: string; price: number; stock: number };
export type StockStatus = 'available' | 'soldout' | 'eta';

export class Product {
  #id: number;
  #name: string;
  #price: string;
  #priceNumber: number;
  #desc: string;
  #tag: string;
  #calories: number;
  #caffeine: string;
  #ingredients: string[];
  #photo?: string;
  #sizes: SizeOption[];
  #iceLevels: string[];
  #sugarLevels: string[];
  #addons: AddonOption[];
  #diet: { halal?: boolean; vegan?: boolean; vegetarian?: boolean; nonDairy?: boolean };
  #caffeineLevel: 'low' | 'medium' | 'high' | 'none';
  #taste: string[];
  #rating: number;
  #reviews: number;
  #bestSeller: boolean;
  #stockStatus: StockStatus;
  #eta?: string;

  constructor(
    id: number,
    name: string,
    price: string,
    desc: string,
    tag: string,
    calories: number,
    caffeine: string,
    ingredients: string[],
    options: {
      photo?: string;
      sizes: SizeOption[];
      iceLevels?: string[];
      sugarLevels?: string[];
      addons?: AddonOption[];
      diet?: { halal?: boolean; vegan?: boolean; vegetarian?: boolean; nonDairy?: boolean };
      caffeineLevel?: 'low' | 'medium' | 'high' | 'none';
      taste?: string[];
      rating?: number;
      reviews?: number;
      bestSeller?: boolean;
      stockStatus?: StockStatus;
      eta?: string;
    }
  ) {
    this.#id = id;
    this.#name = name;
    this.#price = price;
    this.#priceNumber = Number(price.replace(/\./g, ''));
    this.#desc = desc;
    this.#tag = tag;
    this.#calories = calories;
    this.#caffeine = caffeine;
    this.#ingredients = ingredients;
    this.#photo = options.photo;
    this.#sizes = options.sizes;
    this.#iceLevels = options.iceLevels ?? [];
    this.#sugarLevels = options.sugarLevels ?? [];
    this.#addons = options.addons ?? [];
    this.#diet = options.diet ?? {};
    this.#caffeineLevel = options.caffeineLevel ?? 'medium';
    this.#taste = options.taste ?? [];
    this.#rating = options.rating ?? 4.6;
    this.#reviews = options.reviews ?? 120;
    this.#bestSeller = options.bestSeller ?? false;
    this.#stockStatus = options.stockStatus ?? 'available';
    this.#eta = options.eta;
  }

  // Getter (Akses Data)
  get id() { return this.#id; }
  get name() { return this.#name; }
  get price() { return this.#price; }
  get priceNumber() { return this.#priceNumber; }
  get desc() { return this.#desc; }
  get tag() { return this.#tag; }
  get photo() { return this.#photo; }
  get sizes() { return [...this.#sizes]; }
  get iceLevels() { return [...this.#iceLevels]; }
  get sugarLevels() { return [...this.#sugarLevels]; }
  get addons() { return [...this.#addons]; }
  get diet() { return { ...this.#diet }; }
  get caffeineLevel() { return this.#caffeineLevel; }
  get taste() { return [...this.#taste]; }
  get rating() { return this.#rating; }
  get reviews() { return this.#reviews; }
  get bestSeller() { return this.#bestSeller; }
  get stockStatus() { return this.#stockStatus; }
  get eta() { return this.#eta; }
  get specs() {
    // ENCAPSULATION: UI cuma terima snapshot siap pakai, field tetap private
    return {
      calories: this.#calories,
      caffeine: this.#caffeine,
      ingredients: [...this.#ingredients],
    };
  }

  // <--- ENCAPSULATION LOGIC VISUAL
  // UI tidak perlu tahu logic warna, cukup panggil .style
  get style() {
    if (this.#tag === 'HARD') return 'border-white text-white';
    if (this.#tag === 'HYBRID') return 'border-[#00A19B] text-[#00A19B]';
    if (this.#tag === 'DRS OPEN') return 'border-purple-500 text-purple-500';
    return 'border-red-500 text-red-500';
  }
}

// 2. POLYMORPHISM (Strategy Pattern)
// Interface yang menjamin semua filter punya method 'execute'
export interface Strategy {
  execute(products: Product[]): Product[];
}

// Implementasi Polymorphism 1: Filter Soft
export class FilterSoft implements Strategy {
  execute(products: Product[]): Product[] {
    return products.filter(p => p.tag === 'SOFT' || p.tag === 'DRS OPEN');
  }
}

// Implementasi Polymorphism 2: Filter Hard
export class FilterHard implements Strategy {
  execute(products: Product[]): Product[] {
    return products.filter(p => p.tag === 'HARD' || p.tag === 'HYBRID');
  }
}

// 4. OBSERVER / REACTIVE LOGIC UNTUK WEATHER
type WeatherSubscriber = (snapshot: WeatherSnapshot) => void;

export type WeatherSnapshot = {
  temperature: number;
  condition: 'Hot' | 'Cold' | 'Optimal';
  recommendation: string;
};

export class WeatherSystem {
  #temperature: number;
  #subscribers: WeatherSubscriber[] = [];

  constructor() {
    this.#temperature = this.#randomTemp();
  }

  #randomTemp() {
    return Math.floor(Math.random() * 21) + 20; // 20 - 40°C
  }

  subscribe(listener: WeatherSubscriber) {
    this.#subscribers.push(listener);
    listener(this.getSnapshot());
    return () => {
      this.#subscribers = this.#subscribers.filter(l => l !== listener);
    };
  }

  randomize() {
    this.#temperature = this.#randomTemp();
    this.#notify();
  }

  getSnapshot(): WeatherSnapshot {
    const temp = this.#temperature;
    if (temp > 30) {
      return { temperature: temp, condition: 'Hot', recommendation: 'Hot Track • Wet Tyres / Iced Drinks' };
    }
    if (temp < 25) {
      return { temperature: temp, condition: 'Cold', recommendation: 'Cold Track • Slick Tyres / Hot Coffee' };
    }
    return { temperature: temp, condition: 'Optimal', recommendation: 'Balanced Track • Intermediate Tyres / Balanced Drinks' };
  }

  #notify() {
    const snapshot = this.getSnapshot();
    this.#subscribers.forEach(fn => fn(snapshot));
  }
}

// Data Dummy (Database Pura-pura)
export const getProducts = () => [
  new Product(1, "GRAND PRIX ESPRESSO", "35.000", "Short. Dark. Intense. Instant Torque.", "DRS OPEN", 20, "High Torque", ["Single Origin", "No Sugar", "0% Milk"], {
    photo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=70',
    sizes: [
      { id: 'solo', label: 'Solo', priceDelta: 0 },
      { id: 'double', label: 'Double', priceDelta: 8000 },
    ],
    iceLevels: ["Hot"],
    sugarLevels: ["No Sugar", "Normal"],
    addons: [
      { id: 'extra-shot', label: 'Extra Shot', price: 7000, stock: 10 },
      { id: 'oat-milk', label: 'Oat Milk', price: 6000, stock: 5 }
    ],
    diet: { halal: true },
    caffeineLevel: 'high',
    taste: ['bold', 'bitter'],
    rating: 4.9,
    reviews: 320,
    bestSeller: true,
    stockStatus: 'available'
  }),
  new Product(2, "PETRONAS LATTE", "42.000", "Matcha-Espresso Hybrid Power Unit.", "HYBRID", 180, "Hybrid Boost", ["Double Espresso", "Steamed Milk", "Matcha Drizzle"], {
    photo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=70&sat=-5',
    sizes: [
      { id: 'reg', label: 'Regular', priceDelta: 0 },
      { id: 'large', label: 'Large', priceDelta: 6000 },
    ],
    iceLevels: ["Hot", "Iced"],
    sugarLevels: ["Less", "Normal", "More"],
    addons: [
      { id: 'extra-shot', label: 'Extra Shot', price: 7000, stock: 8 },
      { id: 'soy-milk', label: 'Soy Milk', price: 5000, stock: 4 },
      { id: 'vanilla', label: 'Vanilla Syrup', price: 4000, stock: 6 }
    ],
    diet: { halal: true, nonDairy: true },
    caffeineLevel: 'medium',
    taste: ['creamy', 'sweet'],
    rating: 4.8,
    reviews: 410,
    bestSeller: true,
    stockStatus: 'available'
  }),
  new Product(3, "SILVER ARROW BLEND", "38.000", "Signature Milk Coffee. Smooth Aerodynamics.", "SOFT", 150, "Comfort Mode", ["Arabica Blend", "Velvet Milk", "Vanilla Foam"], {
    photo: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=70',
    sizes: [
      { id: 'reg', label: 'Regular', priceDelta: 0 },
      { id: 'large', label: 'Large', priceDelta: 5000 }
    ],
    iceLevels: ["Hot", "Iced"],
    sugarLevels: ["Less", "Normal"],
    addons: [
      { id: 'caramel', label: 'Caramel Syrup', price: 4000, stock: 0 },
      { id: 'extra-foam', label: 'Extra Foam', price: 3000, stock: 12 }
    ],
    diet: { halal: true },
    caffeineLevel: 'medium',
    taste: ['smooth', 'sweet'],
    rating: 4.7,
    reviews: 220,
    bestSeller: false,
    stockStatus: 'available'
  }),
  new Product(4, "PODIUM COLD BREW", "45.000", "12H Extraction. Maximum Cooling.", "HARD", 90, "Cold Charge", ["Cold Brew", "Nitro", "Citrus Mist"], {
    photo: 'https://images.unsplash.com/photo-1551030173-122aabc4489c',
    sizes: [
      { id: 'reg', label: 'Regular', priceDelta: 0 },
      { id: 'xl', label: 'XL', priceDelta: 7000 }
    ],
    iceLevels: ["Iced"],
    sugarLevels: ["No Sugar", "Less"],
    addons: [
      { id: 'citrus', label: 'Citrus Peel', price: 3000, stock: 5 },
      { id: 'nitro-boost', label: 'Nitro Boost', price: 6000, stock: 2 }
    ],
    diet: { halal: true, vegan: true, nonDairy: true },
    caffeineLevel: 'high',
    taste: ['bold', 'citrus'],
    rating: 4.85,
    reviews: 510,
    bestSeller: true,
    stockStatus: 'available'
  }),
  new Product(5, "DRS MOCHA FROST", "48.000", "Iced mocha with aero-grade chocolate.", "DRS OPEN", 220, "Hybrid Boost", ["Espresso", "Dark Cocoa", "Cold Foam"], {
    photo: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=70',
    sizes: [
      { id: 'reg', label: 'Regular', priceDelta: 0 },
      { id: 'large', label: 'Large', priceDelta: 6000 }
    ],
    iceLevels: ["Iced"],
    sugarLevels: ["Less", "Normal", "More"],
    addons: [
      { id: 'choco', label: 'Extra Chocolate', price: 4000, stock: 7 },
      { id: 'whip', label: 'Whip Cream', price: 3000, stock: 0 }
    ],
    diet: { halal: true },
    caffeineLevel: 'medium',
    taste: ['sweet', 'chocolate'],
    rating: 4.6,
    reviews: 180,
    bestSeller: false,
    stockStatus: 'available'
  }),
  new Product(6, "INTERS MEDLEY", "40.000", "Balanced latte with oat milk.", "HYBRID", 160, "Balanced", ["Arabica", "Oat Milk", "Maple Drop"], {
    photo: 'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=900&q=70',
    sizes: [
      { id: 'reg', label: 'Regular', priceDelta: 0 },
      { id: 'large', label: 'Large', priceDelta: 5000 }
    ],
    iceLevels: ["Hot", "Iced"],
    sugarLevels: ["Less", "Normal"],
    addons: [
      { id: 'maple', label: 'Extra Maple', price: 4000, stock: 4 },
      { id: 'cinnamon', label: 'Cinnamon Dust', price: 2000, stock: 10 }
    ],
    diet: { halal: true, nonDairy: true },
    caffeineLevel: 'medium',
    taste: ['balanced', 'nutty'],
    rating: 4.5,
    reviews: 140,
    bestSeller: false,
    stockStatus: 'available'
  }),
  new Product(7, "PIT STOP AFFOGATO", "50.000", "Vanilla gelato drenched in hot espresso.", "SOFT", 230, "Boost", ["Espresso", "Gelato", "Cocoa Dust"], {
    photo: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=900&q=70',
    sizes: [
      { id: 'cup', label: 'Cup', priceDelta: 0 }
    ],
    iceLevels: ["Iced"],
    sugarLevels: ["Normal"],
    addons: [
      { id: 'gelato', label: 'Extra Gelato', price: 8000, stock: 3 },
      { id: 'cocoa', label: 'Cocoa Dust', price: 2000, stock: 10 }
    ],
    diet: { halal: true },
    caffeineLevel: 'high',
    taste: ['sweet', 'creamy'],
    rating: 4.9,
    reviews: 280,
    bestSeller: true,
    stockStatus: 'eta',
    eta: 'Tersedia 15:00'
  }),
  new Product(8, "GARAGE NITRO BLACK", "43.000", "Nitro cold brew, velvety and bold.", "HARD", 65, "Cold Charge", ["Nitro", "Single Origin", "No Sugar"], {
    photo: 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=900&q=70',
    sizes: [
      { id: 'reg', label: 'Regular', priceDelta: 0 },
      { id: 'xl', label: 'XL', priceDelta: 7000 }
    ],
    iceLevels: ["Iced"],
    sugarLevels: ["No Sugar"],
    addons: [
      { id: 'nitro-boost', label: 'Nitro Boost', price: 6000, stock: 1 }
    ],
    diet: { halal: true, vegan: true, nonDairy: true },
    caffeineLevel: 'high',
    taste: ['bold'],
    rating: 4.85,
    reviews: 260,
    bestSeller: false,
    stockStatus: 'soldout',
    eta: 'Restock 17:00'
  }),
  new Product(9, "CHICANE CROISSANT", "28.000", "Buttery pastry, perfect with espresso.", "FOOD", 320, "Low", ["Butter", "Flour", "Almond"], {
    photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=70&sat=-10',
    sizes: [{ id: 'std', label: 'Standard', priceDelta: 0 }],
    addons: [
      { id: 'almond', label: 'Almond Topping', price: 3000, stock: 8 }
    ],
    diet: { halal: true },
    caffeineLevel: 'none',
    taste: ['buttery'],
    rating: 4.6,
    reviews: 90,
    bestSeller: false,
    stockStatus: 'available'
  }),
  new Product(10, "PIT LANE PANINI", "55.000", "Smoked beef, cheddar, and rocket.", "FOOD", 540, "Low", ["Sourdough", "Smoked Beef", "Cheddar"], {
    photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=70',
    sizes: [{ id: 'std', label: 'Standard', priceDelta: 0 }],
    addons: [
      { id: 'extra-cheese', label: 'Extra Cheese', price: 6000, stock: 6 }
    ],
    diet: { halal: true },
    caffeineLevel: 'none',
    taste: ['savory'],
    rating: 4.7,
    reviews: 150,
    bestSeller: true,
    stockStatus: 'available'
  }),
  new Product(11, "SOFT COMPOUND WINGS", "52.000", "Crispy wings with honey glaze.", "SNACK", 480, "Low", ["Chicken", "Honey", "Garlic"], {
    photo: 'https://assets2.chatbotsplace.com/images/rr64-_fried_chicken_wings_79724cdf-9e90-43c5-948f-c1c8b7303ed6.webp',
    sizes: [{ id: '6pcs', label: '6 pcs', priceDelta: 0 }],
    addons: [
      { id: 'extra-sauce', label: 'Extra Sauce', price: 5000, stock: 5 }
    ],
    diet: { halal: true },
    caffeineLevel: 'none',
    taste: ['sweet', 'savory'],
    rating: 4.5,
    reviews: 110,
    bestSeller: false,
    stockStatus: 'available'
  }),
  new Product(12, "PODIUM TIRE DONUT", "32.000", "Chocolate ring donut with glaze.", "SNACK", 380, "Low", ["Cocoa", "Yeast Dough", "Sugar Glaze"], {
    photo: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=900&q=70&sat=-8',
    sizes: [{ id: 'std', label: 'Standard', priceDelta: 0 }],
    addons: [
      { id: 'sprinkle', label: 'Sprinkles', price: 2000, stock: 9 }
    ],
    diet: { halal: true, vegetarian: true },
    caffeineLevel: 'low',
    taste: ['sweet'],
    rating: 4.4,
    reviews: 80,
    bestSeller: false,
    stockStatus: 'available'
  }),
  new Product(13, "GRID START SALAD", "45.000", "Fresh greens, feta, and citrus vinaigrette.", "FOOD", 260, "None", ["Lettuce", "Feta", "Citrus Vinaigrette"], {
    photo: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=70',
    sizes: [{ id: 'bowl', label: 'Bowl', priceDelta: 0 }],
    addons: [
      { id: 'chicken', label: 'Add Chicken', price: 9000, stock: 4 }
    ],
    diet: { halal: true },
    caffeineLevel: 'none',
    taste: ['fresh', 'citrus'],
    rating: 4.3,
    reviews: 70,
    bestSeller: false,
    stockStatus: 'available'
  }),
  new Product(14, "CHEQUERED FLAG BROWNIE", "30.000", "Fudgy brownie squares, dark chocolate.", "SNACK", 410, "Low", ["Dark Chocolate", "Butter", "Sea Salt"], {
    photo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=70&sat=-6',
    sizes: [{ id: 'std', label: 'Standard', priceDelta: 0 }],
    addons: [
      { id: 'sea-salt', label: 'Sea Salt Flakes', price: 2000, stock: 6 }
    ],
    diet: { halal: true, vegetarian: true },
    caffeineLevel: 'low',
    taste: ['sweet', 'chocolate'],
    rating: 4.6,
    reviews: 95,
    bestSeller: false,
    stockStatus: 'available'
  })
];
