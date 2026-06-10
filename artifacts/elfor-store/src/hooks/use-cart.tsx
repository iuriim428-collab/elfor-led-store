import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@workspace/api-client-react";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedKelvin?: string | null;
  selectedAngle?: string | null;
  cartKey: string; // productId + options for uniqueness
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedKelvin?: string | null, selectedAngle?: string | null) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function makeCartKey(productId: number, kelvin?: string | null, angle?: string | null) {
  return `${productId}__${kelvin ?? ""}__${angle ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("elfor_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("elfor_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number, selectedKelvin?: string | null, selectedAngle?: string | null) => {
    const cartKey = makeCartKey(product.id, selectedKelvin, selectedAngle);
    setItems((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);
      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedKelvin, selectedAngle, cartKey }];
    });
  };

  const removeItem = (cartKey: string) => {
    setItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce((sum, item) => {
    let applicablePrice = item.product.price;
    if (item.product.priceTiers && item.product.priceTiers.length > 0) {
      const sortedTiers = [...item.product.priceTiers].sort((a, b) => b.minQty - a.minQty);
      for (const tier of sortedTiers) {
        if (item.quantity >= tier.minQty) {
          applicablePrice = tier.price;
          break;
        }
      }
    }
    return sum + applicablePrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
