import React, { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';
import { Cart } from '../oop/Cart'; // Import Class OOP tadi
import { Product } from '../oop/Logic';

interface CartContextType {
  cart: Cart;
  addToCart: (p: Product) => void;
  removeFromCart: (name: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  refresh: number; // Trigger render ulang manual
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Kita simpan instance Class Cart di dalam state (biar persisten)
  const [cart] = useState(new Cart()); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [refresh, setRefresh] = useState(0); // Hack biar React tahu ada perubahan di dalam Class

  const addToCart = (product: Product) => {
    cart.addItem(product); // Panggil method OOP
    setRefresh(prev => prev + 1); // Paksa render ulang
    setIsCartOpen(true); // Buka sidebar otomatis
  };

  const removeFromCart = (name: string) => {
    cart.removeItem(name); // Panggil method OOP
    setRefresh(prev => prev + 1);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isCartOpen, setIsCartOpen, refresh }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};