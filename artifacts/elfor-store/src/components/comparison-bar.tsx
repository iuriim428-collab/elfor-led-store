import { Link } from "wouter";
import { X, GitCompareArrows } from "lucide-react";
import { useComparison } from "@/hooks/use-comparison";
import { Button } from "@/components/ui/button";
import { resolveStorageUrl } from "@/lib/utils";

export function ComparisonBar() {
  const { items, removeItem, clearComparison, count } = useComparison();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t-2 border-accent shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 text-primary-foreground font-mono text-sm shrink-0">
          <GitCompareArrows className="h-4 w-4 text-accent" />
          <span className="font-bold">Сравнение</span>
          <span className="text-accent font-bold">{count}</span>
        </div>

        <div className="flex-1 flex items-center gap-3 overflow-x-auto min-w-0">
          {items.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 shrink-0"
            >
              {product.imageUrl && (
                <img
                  src={resolveStorageUrl(product.imageUrl)}
                  alt={product.name}
                  className="h-8 w-8 object-contain bg-[#1a1a1a]"
                />
              )}
              <span className="text-primary-foreground font-mono text-xs whitespace-nowrap max-w-[120px] truncate">
                {product.sku}
              </span>
              <button
                onClick={() => removeItem(product.id)}
                className="text-white/60 hover:text-white transition-colors ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearComparison}
            className="font-mono text-xs text-white/60 hover:text-white transition-colors underline underline-offset-2"
          >
            Очистить
          </button>
          <Link href="/compare">
            <Button
              size="sm"
              className="rounded-none bg-accent text-white hover:bg-accent/90 font-mono text-xs uppercase border-0"
            >
              Сравнить →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
