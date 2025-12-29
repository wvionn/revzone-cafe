// 1. ENCAPSULATION: Data dibungkus dalam Class
// Properti dibuat private, akses lewat getter.
// Logic visual (warna tag) disembunyikan di dalam class ini.
export class Product {
  #id: number;
  #name: string;
  #price: string;
  #desc: string;
  #tag: string;

  constructor(id: number, name: string, price: string, desc: string, tag: string) {
    this.#id = id;
    this.#name = name;
    this.#price = price;
    this.#desc = desc;
    this.#tag = tag;
  }

  // Getter (Akses Data)
  get id() { return this.#id; }
  get name() { return this.#name; }
  get price() { return this.#price; }
  get desc() { return this.#desc; }
  get tag() { return this.#tag; }

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

// Data Dummy (Database Pura-pura)
export const getProducts = () => [
  new Product(1, "GRAND PRIX ESPRESSO", "35.000", "Short. Dark. Intense. Instant Torque.", "DRS OPEN"),
  new Product(2, "PETRONAS LATTE", "42.000", "Matcha-Espresso Hybrid Power Unit.", "HYBRID"),
  new Product(3, "SILVER ARROW BLEND", "38.000", "Signature Milk Coffee. Smooth Aerodynamics.", "SOFT"),
  new Product(4, "PODIUM COLD BREW", "45.000", "12H Extraction. Maximum Cooling.", "HARD")
];