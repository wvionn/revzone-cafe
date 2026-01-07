import { useState, useEffect, useMemo } from 'react';
import { Coffee, Menu, X, ArrowRight, Clock, Trophy, Activity, MapPin, Crown, Medal, ShoppingCart, CreditCard, BadgePercent, Receipt, Calendar, Users, Phone } from 'lucide-react';

// IMPORT CLASS OOP DARI FILE SEBELAH
import { getProducts, FilterSoft, FilterHard, WeatherSystem, type Product } from './oop/Logic';

type CartItem = { product: Product; qty: number };

type PromoRule = {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minTotal?: number;
  label: string;
};

const promoRules: PromoRule[] = [
  { code: 'PODIUM10', type: 'percent', value: 10, label: 'Diskon 10% all menu' },
  { code: 'BOXBOX20', type: 'flat', value: 20000, minTotal: 80000, label: 'Potong Rp20k min Rp80k' },
];

const priceToNumber = (price: string) => Number(price.replace(/\./g, ''));
const formatIDR = (value: number) => value.toLocaleString('id-ID');

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // State untuk Filter (Pemicu Polymorphism)
  const [filterMode, setFilterMode] = useState<'ALL' | 'SOFT' | 'HARD'>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoRule | null>(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [payMethod, setPayMethod] = useState<'CASH' | 'QRIS' | 'CARD'>('QRIS');
  const [orderNote, setOrderNote] = useState('');
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpContact, setRsvpContact] = useState('');
  const [rsvpPeople, setRsvpPeople] = useState(2);
  const [rsvpDate, setRsvpDate] = useState('');
  const [rsvpTime, setRsvpTime] = useState('18:00');
  const [rsvpNote, setRsvpNote] = useState('');
  const [rsvpMessage, setRsvpMessage] = useState('');

  // Ambil data OOP sekali, biar gampang nambah produk tanpa ngubah UI
  const products = useMemo(() => getProducts(), []);

  // WEATHER OBSERVER (Track Condition)
  const weatherSystem = useMemo(() => new WeatherSystem(), []);
  const [weather, setWeather] = useState(() => weatherSystem.getSnapshot());
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + priceToNumber(item.product.price) * item.qty, 0), [cart]);
  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percent') return Math.floor(subtotal * appliedPromo.value / 100);
    return Math.min(appliedPromo.value, subtotal);
  }, [appliedPromo, subtotal]);
  const total = useMemo(() => Math.max(subtotal - discount, 0), [subtotal, discount]);

  useEffect(() => weatherSystem.subscribe(setWeather), [weatherSystem]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- LOGIC OOP DIJALANKAN DI SINI ---
  const menuItems: Product[] = useMemo(() => {
    // <--- POLYMORPHISM BERJALAN DI SINI
    // Kita memanggil method .execute() yang sama, tapi perilakunya beda
    // tergantung class Strategy mana yang dipakai (FilterSoft / FilterHard).
    if (filterMode === 'SOFT') return new FilterSoft().execute(products);
    if (filterMode === 'HARD') return new FilterHard().execute(products);
    return products;
  }, [filterMode, products]);
  // -------------------------------------

  // Podium kini ditarik dari data produk biar selalu sinkron
  const podiumFinishers = useMemo(() => {
    const podiumDecor = [
      { votes: "5.0 ★", medalColor: "text-yellow-400", borderColor: "border-yellow-400", bgColor: "bg-yellow-400/10", icon: <Crown className="text-yellow-400 animate-bounce" size={24} /> },
      { votes: "4.9 ★", medalColor: "text-gray-300", borderColor: "border-gray-300", bgColor: "bg-gray-300/10", icon: <Medal className="text-gray-300" size={24} /> },
      { votes: "4.8 ★", medalColor: "text-orange-400", borderColor: "border-orange-400", bgColor: "bg-orange-400/10", icon: <Medal className="text-orange-400" size={24} /> }
    ];

    return products.slice(0, 3).map((p, idx) => ({
      pos: idx + 1,
      name: p.name,
      desc: p.desc,
      ...podiumDecor[idx]
    }));
  }, [products]);

  const strategies = [
    { type: "SOFT", color: "border-red-500", text: "text-red-500", title: "Butuh Energi Cepat?", desc: "Manis & Creamy. Cocok buat mood booster.", rec: "Caramel Macchiato" },
    { type: "MEDIUM", color: "border-yellow-400", text: "text-yellow-400", title: "Mau Santai?", desc: "Rasa seimbang susu & kopi. Tahan lama.", rec: "Classic Latte" },
    { type: "HARD", color: "border-white", text: "text-white", title: "Begadang / Fokus?", desc: "Pahit & Kuat. Kafein maksimal.", rec: "Double Espresso" },
  ];


  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const handleUpdateQty = (id: number, delta: number) => {
    setCart(prev => prev
      .map(item => item.product.id === id ? { ...item, qty: Math.max(item.qty + delta, 1) } : item)
      .filter(item => item.qty > 0));
  };

  const handleRemoveItem = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const rule = promoRules.find(r => r.code === code);
    if (!rule) {
      setAppliedPromo(null);
      setPromoMessage('Kode tidak dikenal');
      return;
    }
    if (rule.minTotal && subtotal < rule.minTotal) {
      setAppliedPromo(null);
      setPromoMessage(`Minimal transaksi Rp ${formatIDR(rule.minTotal)} untuk kode ini.`);
      return;
    }
    setAppliedPromo(rule);
    setPromoMessage(`Kode ${rule.code} aktif (${rule.label})`);
  };

  const handleCheckout = () => {
    if (!cart.length) return;
    setCheckoutOpen(true);
  };

  const handleBoxBox = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMenuOpen(false);
  };

  const handleRsvpSubmit = () => {
    if (!rsvpName || !rsvpContact || !rsvpDate || !rsvpTime) {
      setRsvpMessage('Please fill name, contact, date, and time.');
      return;
    }
    setRsvpMessage(`Reservation locked for ${rsvpPeople} pax at ${rsvpTime}, ${rsvpDate}. We will confirm via ${rsvpContact}.`);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#1F2937] font-sans selection:bg-[#00A19B] selection:text-white overflow-x-hidden">
      
      {/* PIT LANE STRIPES */}
      <div className="fixed top-0 left-0 w-full h-2 z-[60] bg-[repeating-linear-gradient(45deg,#00A19B,#00A19B_10px,#111_10px,#111_20px)]"></div>
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur border-b-2 border-[#00A19B] py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-12 h-8 bg-black skew-x-[-12deg] flex items-center justify-center border-l-4 border-[#00A19B]">
               <span className="text-[#00A19B] font-mono font-bold text-lg skew-x-[12deg]">RZ</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-widest uppercase">REV<span className="text-[#00A19B]">ZONE</span></span>
              <span className="text-[10px] font-mono text-gray-500 tracking-wider">PIT_LANE_CAFE_V2.1</span>
            </div>
          </div>

          <div className="hidden md:flex gap-1 items-center font-mono text-xs font-bold uppercase tracking-wider">
            {['SECTOR 1: HOME', 'SECTOR 2: TOP RATED', 'SECTOR 3: MENU'].map((item, idx) => (
              <a key={idx} href={`#${item.split(' ')[2].toLowerCase()}`} className="px-4 py-2 hover:bg-[#00A19B] hover:text-white transition-colors border-r border-gray-300 last:border-0 relative group">
                {item}
                <span className="absolute top-0 right-1 w-1 h-1 bg-green-500 rounded-full opacity-0 group-hover:opacity-100"></span>
              </a>
            ))}
            <button onClick={() => setRsvpOpen(true)} className="ml-6 px-6 py-2 bg-black text-[#00A19B] skew-x-[-12deg] hover:bg-[#00A19B] hover:text-black transition-all font-bold border border-[#00A19B]">
              <span className="skew-x-[12deg] inline-block">RSVP: PADDOCK</span>
            </button>
          </div>

          <button className="md:hidden text-black border border-black p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 border-b-4 border-black">
        <div className="absolute right-0 top-0 w-1/3 h-full border-l border-gray-300 hidden lg:block"></div>
        

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
                <span className="px-2 py-1 bg-[#00A19B] text-white text-[10px] font-mono font-bold">STATUS: GREEN FLAG</span>
                <button onClick={() => weatherSystem.randomize()} className="px-2 py-1 border border-black text-[10px] font-mono font-bold hover:bg-[#00A19B] hover:text-black transition-colors">
                  TRACK TEMP: {weather.temperature}°C • {weather.condition}
                </button>
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-black leading-[0.85] tracking-tighter mb-6">
              FUEL <span className="text-transparent bg-clip-text bg-[repeating-linear-gradient(45deg,#00A19B,#00A19B_10px,#111_10px,#111_20px)]">UP.</span><br />
              <span className="text-gray-400">GO FAST.</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 font-mono max-w-md border-l-4 border-[#00A19B] pl-4">
              // PRECISION COFFEE ENGINEERING.<br/>
              Pit stop for your daily caffeine intake.
            </p>
            <p className="text-xs font-mono text-gray-500 mb-4 bg-black text-[#00A19B] inline-flex px-2 py-1 skew-x-[-6deg]">{weather.recommendation}</p>
            <div className="flex gap-4">
              <button onClick={handleBoxBox} className="px-10 py-5 bg-black text-[#00A19B] font-black text-xl skew-x-[-12deg] hover:bg-[#00A19B] hover:text-black transition-all shadow-[5px_5px_0px_#ccc] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-3 border-2 border-transparent hover:border-black">
                <span className="skew-x-[12deg] flex items-center gap-2">BOX BOX <ArrowRight strokeWidth={3} /></span>
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block">
              <div className="relative w-80 mx-auto bg-black text-white p-1 rounded-lg shadow-2xl transform rotate-1 border-t-8 border-[#00A19B]">
                <div className="bg-[#1A1A1A] p-6 border-2 border-dashed border-gray-700">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[#00A19B] font-black italic text-2xl uppercase w-1/2 leading-none">Driver of The Day</span>
                        <div className="text-right">
                           <span className="block text-xs font-mono text-gray-500">RECOMMENDED</span>
                           <span className="block text-xl font-bold">MUST TRY</span>
                        </div>
                    </div>
                    
                    <div className="relative aspect-square bg-gray-800 rounded-lg mb-4 overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#00A19B_0%,transparent_70%)] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Coffee size={64} className="text-gray-300 drop-shadow-lg" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-[#00A19B] text-black text-xs font-bold px-2 py-1 rotate-[-5deg]">
                            PROMO 20%
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-black italic uppercase">Petronas Latte</h3>
                        <p className="text-xs text-gray-500 font-mono mt-2">"Absolute pace setter." - Toto</p>
                    </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* PODIUM FINISHERS */}
      <section id="top" className="py-20 bg-black text-white border-b-4 border-[#00A19B] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gray-900 skew-x-[-20deg] border-l border-gray-800"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
           <div className="flex items-center gap-4 mb-12">
             <Trophy className="text-[#00A19B]" size={32} />
             <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Podium Finishers</h2>
                <p className="text-gray-500 text-xs font-mono">HIGHEST RATED PRODUCTS • FAN FAVORITES</p>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-4 font-mono">
                  {podiumFinishers.map((item, idx) => (
                      <div key={idx} className={`relative flex items-center bg-[#1A1A1A] p-4 border-l-8 ${item.borderColor} hover:translate-x-2 transition-transform cursor-default group overflow-hidden`}>
                          <div className={`absolute inset-0 ${item.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                          <div className="w-12 flex justify-center items-center relative z-10">
                              {item.icon}
                          </div>
                          <div className="flex-1 px-4 relative z-10">
                              <h4 className={`text-lg font-bold italic ${item.medalColor}`}>{item.name}</h4>
                              <span className="text-[10px] text-gray-400 font-sans block">{item.desc}</span>
                          </div>
                          <div className="text-right relative z-10">
                              <div className={`${item.medalColor} font-black text-xl`}>{item.votes}</div>
                              <div className="text-[10px] text-gray-500 text-center">RATING</div>
                          </div>
                      </div>
                  ))}
                  <div className="text-center pt-4">
                      <p className="text-xs text-gray-500 italic">"Ini produk paling laku, Boss!"</p>
                  </div>
              </div>

              <div>
                  <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                     <Activity size={20} className="text-[#00A19B]" /> Recommended Strategy
                  </h3>
                  <p className="text-gray-500 text-xs mb-4">Bingung mau pesan apa? Pilih sesuai kebutuhan energi kamu:</p>
                  
                  <div className="grid gap-4">
                      {strategies.map((strat, idx) => (
                          <div key={idx} className="bg-[#1A1A1A] p-4 rounded border border-gray-800 flex items-center gap-4 hover:border-gray-600 transition-colors">
                              <div className={`w-12 h-12 rounded-full border-4 ${strat.color} bg-[#111] flex items-center justify-center flex-shrink-0`}>
                                  <span className={`font-black text-xs ${strat.text}`}>{strat.type.charAt(0)}</span>
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between mb-1">
                                      <span className={`font-bold text-sm ${strat.text}`}>{strat.title}</span>
                                      <span className="text-[10px] font-mono text-gray-500 uppercase bg-black px-2 py-0.5 rounded">Coba: {strat.rec}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 leading-tight">{strat.desc}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* TELEMETRY */}
      <section className="py-12 bg-gray-100 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: "EXTRACTION", val: "25.4s", status: "OK" },
             { label: "PRESSURE", val: "9 BAR", status: "OK" },
             { label: "TEMP", val: "93°C", status: "HOT" },
             { label: "STOCK", val: "98%", status: "HIGH" },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-4 border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-mono font-bold text-gray-400">{stat.label}</span>
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="text-2xl font-black text-black">{stat.val}</div>
                <div className="mt-2 w-full bg-gray-200 h-1">
                   <div className="bg-[#00A19B] h-full" style={{width: '80%'}}></div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* MENU - PIT STRATEGY BOARD */}
      <section id="menu" className="py-24 bg-[#111] text-white relative">
        <div className="absolute right-10 top-10 grid grid-cols-4 gap-1 opacity-20">
             {[...Array(16)].map((_,i) => <div key={i} className="w-2 h-2 bg-[#00A19B] rounded-full"></div>)}
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-700 pb-6">
            <div>
              <div className="inline-block bg-[#00A19B] text-black px-2 py-1 font-mono text-xs font-bold mb-2">SECTOR 3</div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter">Pit <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A19B] to-white">Menu</span></h2>
              <p className="text-gray-500 text-xs font-mono mt-2">Tap kartu untuk lihat detail. Klik tambah buat masuk keranjang.</p>
            </div>
            
            {/* BUTTON FILTER UNTUK TEST POLYMORPHISM */}
            <div className="text-right flex gap-2">
                <button onClick={() => setFilterMode('ALL')} className={`px-2 py-1 text-xs border ${filterMode === 'ALL' ? 'bg-[#00A19B] text-black' : 'text-gray-500 border-gray-500'}`}>ALL</button>
                <button onClick={() => setFilterMode('SOFT')} className={`px-2 py-1 text-xs border ${filterMode === 'SOFT' ? 'bg-red-500 text-white' : 'text-gray-500 border-gray-500'}`}>SOFT</button>
                <button onClick={() => setFilterMode('HARD')} className={`px-2 py-1 text-xs border ${filterMode === 'HARD' ? 'bg-white text-black' : 'text-gray-500 border-gray-500'}`}>HARD</button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-4">
              {/* LOOPING DATA DARI OOP */}
              {menuItems.map((item, idx) => (
                <div key={idx} onClick={() => handleOpenProduct(item)} className="group flex flex-col md:flex-row items-center bg-[#1A1A1A] border-l-4 border-transparent hover:border-[#00A19B] p-4 transition-all hover:translate-x-2 cursor-pointer">
                  <div className="flex-shrink-0 mr-6 hidden md:flex flex-col items-center justify-center w-16">
                        {/* <--- ENCAPSULATION: STYLE DI PANGGIL DARI CLASS */}
                        <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-[#111] ${item.style}`}>
                           <span className="font-bold text-xs">{item.tag.charAt(0)}</span>
                        </div>
                  </div>

                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
                      <h3 className="text-xl font-black italic tracking-wide uppercase group-hover:text-[#00A19B] transition-colors">{item.name}</h3>
                      <div className="flex items-center justify-center md:justify-end gap-2 mt-2 md:mt-0">
                          <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">{item.tag}</span>
                          <span className="text-xl font-mono font-bold text-[#00A19B] bg-[#00A19B]/10 px-3 py-1">Rp {item.price}</span>
                      </div>
                    </div>
                    <p className="text-gray-500 font-mono text-xs md:max-w-xl">{item.desc}</p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-6 flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }} className="bg-[#00A19B] text-black px-3 py-2 rounded-sm hover:bg-white transition-colors text-xs font-bold flex items-center gap-1">
                          <ShoppingCart size={16} /> Add
                      </button>
                      <button className="bg-transparent text-[#00A19B] border border-[#00A19B]/40 p-2 rounded-sm hover:border-white transition-colors">
                          <ArrowRight size={20} />
                      </button>
                  </div>
                </div>
              ))}
            </div>

            {/* CART / CHECKOUT PANEL */}
            <div className="bg-[#0f172a] border border-[#00A19B]/40 p-4 text-sm text-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-mono text-gray-400">PIT WALL</p>
                  <h3 className="text-xl font-black text-white flex items-center gap-2"><ShoppingCart size={18} className="text-[#00A19B]"/> Cart & Promo</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-1 border border-[#00A19B]/50 bg-[#00A19B]/10 rounded">{cart.length} item</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-auto pr-1">
                {cart.length === 0 && <p className="text-gray-500 text-xs">Belum ada order. Tambah dari menu.</p>}
                {cart.map(item => (
                  <div key={item.product.id} className="border border-[#00A19B]/20 p-2 bg-[#0b1224]">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-sm">{item.product.name}</p>
                        <p className="text-[11px] text-gray-400">Rp {item.product.price}</p>
                      </div>
                      <button onClick={() => handleRemoveItem(item.product.id)} className="text-[11px] text-red-400 hover:text-red-200">Remove</button>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleUpdateQty(item.product.id, -1)} className="w-6 h-6 bg-[#111827] border border-gray-600 text-white">-</button>
                        <span className="text-white">{item.qty}</span>
                        <button onClick={() => handleUpdateQty(item.product.id, 1)} className="w-6 h-6 bg-[#00A19B] text-black font-bold">+</button>
                      </div>
                      <span className="font-mono text-[#00A19B]">Rp {formatIDR(priceToNumber(item.product.price) * item.qty)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-[11px] text-gray-400 font-mono flex items-center gap-2"><BadgePercent size={14}/> Promo Code</label>
                <div className="flex gap-2">
                  <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="PODIUM10 / BOXBOX20" className="flex-1 bg-[#0b1224] border border-[#00A19B]/30 px-2 py-2 text-white text-xs outline-none" />
                  <button onClick={handleApplyPromo} className="px-3 py-2 bg-[#00A19B] text-black text-xs font-bold">Apply</button>
                </div>
                {promoMessage && <p className="text-[11px] text-gray-300">{promoMessage}</p>}
              </div>

              <div className="mt-4 border-t border-[#00A19B]/30 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>Rp {formatIDR(subtotal)}</span></div>
                <div className="flex justify-between text-gray-300"><span>Discount</span><span>- Rp {formatIDR(discount)}</span></div>
                <div className="flex justify-between text-white font-bold text-sm"><span>Total</span><span>Rp {formatIDR(total)}</span></div>
              </div>

              <button disabled={!cart.length} onClick={handleCheckout} className={`mt-4 w-full flex items-center justify-center gap-2 py-3 text-sm font-bold ${cart.length ? 'bg-[#00A19B] text-black hover:bg-white' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}>
                <CreditCard size={18}/> Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-200 pt-16 pb-8 border-t-8 border-black text-black">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 font-mono text-sm">
          <div className="col-span-1 md:col-span-2">
            <h1 className="text-2xl font-black italic tracking-tighter mb-4">REV<span className="text-[#00A19B]">ZONE</span></h1>
            <div className="p-4 bg-white border border-gray-300 max-w-sm shadow-[4px_4px_0px_#000]">
                <p className="mb-2 font-bold uppercase border-b border-gray-200 pb-2">Team Radio:</p>
                <p className="text-gray-600">"Get in there, Lewis! Best coffee in the sector."</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase mb-4 flex items-center gap-2">
                <Clock size={16} className="text-[#00A19B]" /> Pit Window
            </h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex justify-between border-b border-gray-300 border-dashed pb-1"><span>FP1-FP2 (Mon-Fri)</span> <span>08:00 - 22:00</span></li>
              <li className="flex justify-between border-b border-gray-300 border-dashed pb-1"><span>Quali-Race (Sat-Sun)</span> <span>08:00 - 00:00</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-[#00A19B]" /> Track Position
            </h4>
            <p className="text-gray-600 mb-4">
              Sector 4, Lot 44<br/>
              SCBD Grand Prix Circuit<br/>
              Jakarta
            </p>
            <button className="w-full py-2 bg-black text-[#00A19B] font-bold uppercase hover:bg-[#00A19B] hover:text-black transition-colors border border-black">
               Locate on GPS
            </button>
          </div>
        </div>
        
        <div className="mt-12 text-center">
            <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#333,#333_10px,#Facc15_10px,#Facc15_20px)] opacity-20 mb-4"></div>
            <p className="font-mono text-xs text-gray-500">© 2024 REVZONE TEAM. NO SAFETY CAR DEPLOYED.</p>
        </div>
      </footer>

      {/* TECHNICAL SCRUTINEERING MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center px-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-[#0c1220] border-4 border-[#00A19B] shadow-2xl max-w-2xl w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-[#00A19B] hover:text-white" onClick={() => setSelectedProduct(null)} aria-label="Close">
              <X size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-mono text-gray-400 uppercase">Technical Scrutineering</p>
                <h3 className="text-2xl font-black italic text-white">{selectedProduct.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{selectedProduct.desc}</p>
                <div className="inline-flex items-center gap-2 text-[10px] font-mono bg-black px-2 py-1 text-[#00A19B] border border-[#00A19B]">{selectedProduct.tag} • Rp {selectedProduct.price}</div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleAddToCart(selectedProduct)} className="bg-[#00A19B] text-black px-3 py-2 text-xs font-bold flex items-center gap-2">
                    <ShoppingCart size={16}/> Add to Cart
                  </button>
                  <button onClick={() => setSelectedProduct(null)} className="text-xs text-gray-400 underline">Close</button>
                </div>
              </div>
              <div className="bg-[#0b152b] border border-[#00A19B]/40 p-3 font-mono text-xs text-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'radial-gradient(#00A19B 1px, transparent 1px)', backgroundSize:'12px 12px', opacity:0.2}}></div>
                <h4 className="text-[#00A19B] font-bold uppercase mb-2">Blueprint Specs</h4>
                <ul className="space-y-1 relative z-10">
                  <li>Calories: {selectedProduct.specs.calories} kCal</li>
                  <li>Caffeine Mode: {selectedProduct.specs.caffeine}</li>
                  <li>Ingredients: {selectedProduct.specs.ingredients.join(', ')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center px-4" onClick={() => setCheckoutOpen(false)}>
          <div className="bg-white max-w-3xl w-full rounded-md shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#00A19B] text-black px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black uppercase tracking-tight">
                <Receipt size={18}/> Checkout Summary
              </div>
              <button onClick={() => setCheckoutOpen(false)} aria-label="Close"><X size={18}/></button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700"><ShoppingCart size={16}/> Order Items</div>
                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                  {cart.map(item => (
                    <div key={item.product.id} className="border border-gray-200 p-2 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{item.product.name}</p>
                        <p className="text-[11px] text-gray-500">{item.qty} x Rp {item.product.price}</p>
                      </div>
                      <p className="font-mono text-sm text-[#00A19B]">Rp {formatIDR(priceToNumber(item.product.price) * item.qty)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 text-sm space-y-1">
                  <div className="flex justify-between text-gray-700"><span>Subtotal</span><span>Rp {formatIDR(subtotal)}</span></div>
                  <div className="flex justify-between text-gray-700"><span>Discount</span><span>- Rp {formatIDR(discount)}</span></div>
                  <div className="flex justify-between text-black font-bold"><span>Total</span><span>Rp {formatIDR(total)}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700"><CreditCard size={16}/> Payment & Details</div>
                <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Nama Pemesan" className="w-full border border-gray-200 px-3 py-2 text-sm" />
                <input value={buyerContact} onChange={(e) => setBuyerContact(e.target.value)} placeholder="No. WA / Email" className="w-full border border-gray-200 px-3 py-2 text-sm" />
                <div className="flex gap-2 text-xs">
                  {(['QRIS','CASH','CARD'] as const).map(method => (
                    <button key={method} onClick={() => setPayMethod(method)} className={`flex-1 border px-2 py-2 ${payMethod === method ? 'bg-[#00A19B] text-black border-[#00A19B]' : 'border-gray-300 text-gray-700'}`}>
                      {method}
                    </button>
                  ))}
                </div>
                <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Catatan (mis: less ice, no sugar)" className="w-full border border-gray-200 px-3 py-2 text-sm min-h-[80px]"></textarea>
                <button className="w-full bg-black text-[#00A19B] py-3 font-bold hover:bg-[#00A19B] hover:text-black transition" onClick={() => setCheckoutOpen(false)}>
                  Confirm & Pay (stub)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RSVP / Paddock Reservation */}
      {rsvpOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center px-4" onClick={() => setRsvpOpen(false)}>
          <div className="bg-white max-w-2xl w-full rounded-md shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-black text-[#00A19B] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black uppercase tracking-tight">
                <Calendar size={18}/> Paddock Reservation
              </div>
              <button onClick={() => setRsvpOpen(false)} aria-label="Close"><X size={18} className="text-[#00A19B]"/></button>
            </div>
            <div className="p-4 space-y-3 text-sm text-gray-800">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 border border-gray-200 px-3 py-2">
                  <Users size={16} className="text-[#00A19B]"/>
                  <input type="number" min={1} value={rsvpPeople} onChange={(e) => setRsvpPeople(Number(e.target.value) || 1)} className="w-full outline-none" placeholder="Jumlah orang" />
                </div>
                <div className="flex items-center gap-2 border border-gray-200 px-3 py-2">
                  <Phone size={16} className="text-[#00A19B]"/>
                  <input value={rsvpContact} onChange={(e) => setRsvpContact(e.target.value)} className="w-full outline-none" placeholder="No. WA / Email" />
                </div>
                <input value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="Nama" className="border border-gray-200 px-3 py-2" />
                <input type="date" value={rsvpDate} onChange={(e) => setRsvpDate(e.target.value)} className="border border-gray-200 px-3 py-2" />
                <input type="time" value={rsvpTime} onChange={(e) => setRsvpTime(e.target.value)} className="border border-gray-200 px-3 py-2" />
                <input value={rsvpNote} onChange={(e) => setRsvpNote(e.target.value)} placeholder="Catatan (table preference, dll)" className="border border-gray-200 px-3 py-2" />
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-[#00A19B] font-mono">INFO</span>
                <p>Reservasi akan dikonfirmasi manual. Jangan taruh data sensitif; cukup kontak yang bisa dihubungi.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleRsvpSubmit} className="flex-1 bg-[#00A19B] text-black font-bold py-3 hover:bg-black hover:text-[#00A19B] transition">Submit</button>
                <button onClick={() => setRsvpOpen(false)} className="px-4 py-3 border border-gray-300 text-gray-600">Close</button>
              </div>
              {rsvpMessage && <p className="text-xs text-[#00A19B] font-mono">{rsvpMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;