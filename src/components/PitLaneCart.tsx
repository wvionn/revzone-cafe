import React from 'react';
import { X, ShoppingBag, Plus, Minus, Flag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const PitLaneCart = () => {
  const { cart, removeFromCart, addToCart, isCartOpen, setIsCartOpen } = useCart();

  // Kalau keranjang tutup, return null (atau bisa mainan CSS transform)
  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay Gelap */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Sidebar Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111] border-l-4 border-[#00A19B] z-[70] shadow-2xl transform transition-transform flex flex-col">
        
        {/* Header: Pit Lane Status */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1A1A1A]">
          <div>
            <h2 className="text-2xl font-black italic text-white flex items-center gap-2">
              PIT LANE <ShoppingBag className="text-[#00A19B]" />
            </h2>
            <p className="text-[#00A19B] font-mono text-xs">/// STRATEGY UPDATE</p>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">
            <X size={28} />
          </button>
        </div>

        {/* Content: List Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.items.length === 0 ? (
            <div className="text-center text-gray-500 font-mono mt-20">
              <p className="text-6xl mb-4">🏎️</p>
              <p>NO TYRES SELECTED.</p>
              <p className="text-xs">Select your menu strategy first.</p>
            </div>
          ) : (
            cart.items.map((item, idx) => (
              <div key={idx} className="bg-[#0a0a0a] border border-gray-800 p-4 flex justify-between items-center relative overflow-hidden group">
                {/* Visual Accent */}
                <div className={`absolute left-0 top-0 h-full w-1 ${item.product.style.split(' ')[0]}`}></div>

                <div>
                  <h4 className="font-bold text-white uppercase italic">{item.product.name}</h4>
                  <div className="text-xs font-mono text-gray-400 mt-1">
                    <span className="text-[#00A19B]">Rp {item.product.price}</span> 
                    <span className="mx-2">x</span> 
                    <span className="text-white font-bold">{item.quantity}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-[#1A1A1A] rounded p-1">
                  <button onClick={() => removeFromCart(item.product.name)} className="p-1 hover:text-red-500 text-gray-400">
                    <Minus size={16} />
                  </button>
                  <span className="font-mono font-bold text-white w-4 text-center">{item.quantity}</span>
                  <button onClick={() => addToCart(item.product)} className="p-1 hover:text-[#00A19B] text-gray-400">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Checkout (Race Start) */}
        <div className="p-6 border-t border-gray-800 bg-[#1A1A1A]">
          <div className="flex justify-between items-center mb-4 font-mono">
            <span className="text-gray-400">FUEL COST (TOTAL)</span>
            <span className="text-2xl font-bold text-[#00A19B]">Rp {cart.totalPrice}</span>
          </div>
          
          <button 
            disabled={cart.totalItems === 0}
            className="w-full bg-[#00A19B] text-black font-black py-4 text-xl italic uppercase hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 skew-x-[-10deg]"
          >
            <span className="skew-x-[10deg] flex items-center gap-2">
              INITIATE RACE START <Flag size={20}/>
            </span>
          </button>
        </div>
      </div>
    </>
  );
};