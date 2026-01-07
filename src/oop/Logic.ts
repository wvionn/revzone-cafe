// 1. ENCAPSULATION: Data dibungkus dalam Class
// Properti dibuat private, akses lewat getter.
// Logic visual (warna tag) disembunyikan di dalam class ini.
export class Product {
  #id: number;
  #name: string;
  #price: string;
  #desc: string;
  #tag: string;
  #calories: number;
  #caffeine: string;
  #ingredients: string[];

  constructor(id: number, name: string, price: string, desc: string, tag: string, calories: number, caffeine: string, ingredients: string[]) {
    this.#id = id;
    this.#name = name;
    this.#price = price;
    this.#desc = desc;
    this.#tag = tag;
    this.#calories = calories;
    this.#caffeine = caffeine;
    this.#ingredients = ingredients;
  }

  // Getter (Akses Data)
  get id() { return this.#id; }
  get name() { return this.#name; }
  get price() { return this.#price; }
  get desc() { return this.#desc; }
  get tag() { return this.#tag; }
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
  new Product(1, "GRAND PRIX ESPRESSO", "35.000", "Short. Dark. Intense. Instant Torque.", "DRS OPEN", 20, "High Torque", ["Single Origin", "No Sugar", "0% Milk"]),
  new Product(2, "PETRONAS LATTE", "42.000", "Matcha-Espresso Hybrid Power Unit.", "HYBRID", 180, "Hybrid Boost", ["Double Espresso", "Steamed Milk", "Matcha Drizzle"]),
  new Product(3, "SILVER ARROW BLEND", "38.000", "Signature Milk Coffee. Smooth Aerodynamics.", "SOFT", 150, "Comfort Mode", ["Arabica Blend", "Velvet Milk", "Vanilla Foam"]),
  new Product(4, "PODIUM COLD BREW", "45.000", "12H Extraction. Maximum Cooling.", "HARD", 90, "Cold Charge", ["Cold Brew", "Nitro", "Citrus Mist"]),
  new Product(5, "DRS MOCHA FROST", "48.000", "Iced mocha with aero-grade chocolate.", "DRS OPEN", 220, "Hybrid Boost", ["Espresso", "Dark Cocoa", "Cold Foam"]),
  new Product(6, "INTERS MEDLEY", "40.000", "Balanced latte with oat milk.", "HYBRID", 160, "Balanced", ["Arabica", "Oat Milk", "Maple Drop"]),
  new Product(7, "PIT STOP AFFOGATO", "50.000", "Vanilla gelato drenched in hot espresso.", "SOFT", 230, "Boost", ["Espresso", "Gelato", "Cocoa Dust"]),
  new Product(8, "GARAGE NITRO BLACK", "43.000", "Nitro cold brew, velvety and bold.", "HARD", 65, "Cold Charge", ["Nitro", "Single Origin", "No Sugar"]),
  new Product(9, "CHICANE CROISSANT", "28.000", "Buttery pastry, perfect with espresso.", "FOOD", 320, "Low", ["Butter", "Flour", "Almond"]),
  new Product(10, "PIT LANE PANINI", "55.000", "Smoked beef, cheddar, and rocket.", "FOOD", 540, "Low", ["Sourdough", "Smoked Beef", "Cheddar"]),
  new Product(11, "SOFT COMPOUND WINGS", "52.000", "Crispy wings with honey glaze.", "SNACK", 480, "Low", ["Chicken", "Honey", "Garlic"]),
  new Product(12, "PODIUM TIRE DONUT", "32.000", "Chocolate ring donut with glaze.", "SNACK", 380, "Low", ["Cocoa", "Yeast Dough", "Sugar Glaze"]),
  new Product(13, "GRID START SALAD", "45.000", "Fresh greens, feta, and citrus vinaigrette.", "FOOD", 260, "None", ["Lettuce", "Feta", "Citrus Vinaigrette"]),
  new Product(14, "CHEQUERED FLAG BROWNIE", "30.000", "Fudgy brownie squares, dark chocolate.", "SNACK", 410, "Low", ["Dark Chocolate", "Butter", "Sea Salt"])
];
