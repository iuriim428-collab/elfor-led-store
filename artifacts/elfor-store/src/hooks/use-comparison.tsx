import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@workspace/api-client-react";

const MAX_COMPARE = 4;

interface ComparisonContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  toggleItem: (product: Product) => void;
  isInComparison: (productId: number) => boolean;
  clearComparison: () => void;
  count: number;
  isFull: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem("elfor_compare");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("elfor_compare", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleItem = (product: Product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  };

  const isInComparison = (productId: number) =>
    items.some((p) => p.id === productId);

  const clearComparison = () => setItems([]);

  return (
    <ComparisonContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        isInComparison,
        clearComparison,
        count: items.length,
        isFull: items.length >= MAX_COMPARE,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
