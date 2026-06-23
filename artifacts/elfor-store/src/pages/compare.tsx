import { Link } from "wouter";
import { X, ShoppingCart, ArrowLeft, GitCompareArrows } from "lucide-react";
import { useComparison } from "@/hooks/use-comparison";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { cn, formatValueWithUnit } from "@/lib/utils";

type SpecRow = { key: string; values: (string | null)[] };

function buildSpecRows(products: ReturnType<typeof useComparison>["items"]): SpecRow[] {
  const allKeys = new Set<string>();

  const getProductSpecs = (p: (typeof products)[0]): Record<string, string> => {
    const map: Record<string, string> = {};
    if (p.specs) {
      for (const s of p.specs as { key: string; value: string; unit?: string }[]) {
        map[s.key] = s.unit ? `${s.value}\u00a0${s.unit}` : s.value;
      }
    }
    if (p.power) map["Мощность"] = formatValueWithUnit(p.power, "Вт");
    if (p.lumens) map["Световой поток"] = formatValueWithUnit(p.lumens, "лм");
    if (p.colorTemp) map["Цветовая температура"] = p.colorTemp;
    if (p.ipRating) map["Степень защиты"] = p.ipRating;
    if (p.warranty) map["Гарантия"] = formatValueWithUnit(p.warranty, "лет");
    return map;
  };

  const productSpecMaps = products.map(getProductSpecs);
  productSpecMaps.forEach((m) => Object.keys(m).forEach((k) => allKeys.add(k)));

  return Array.from(allKeys).map((key) => ({
    key,
    values: productSpecMaps.map((m) => m[key] ?? null),
  }));
}

export default function Compare() {
  const { items, removeItem, clearComparison } = useComparison();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <GitCompareArrows className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        <h1 className="font-serif font-bold text-3xl uppercase mb-4">Список сравнения пуст</h1>
        <p className="font-mono text-sm text-muted-foreground mb-8">
          Добавьте товары для сравнения через кнопку «Сравнить» на карточке товара
        </p>
        <Link href="/catalog">
          <Button className="rounded-none bg-accent text-white hover:bg-accent/90 uppercase font-mono">
            Перейти в каталог
          </Button>
        </Link>
      </div>
    );
  }

  const specRows = buildSpecRows(items);
  const hasHighlight = (row: SpecRow) => {
    const uniq = new Set(row.values.filter(Boolean));
    return uniq.size > 1;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pb-24">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/catalog" className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            В каталог
          </Link>
          <h1 className="font-serif font-bold text-2xl uppercase">Сравнение товаров</h1>
        </div>
        <button
          onClick={clearComparison}
          className="font-mono text-xs text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
        >
          Очистить всё
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${items.length * 260 + 200}px` }}>
          {/* Product headers */}
          <thead>
            <tr>
              <th className="w-48 shrink-0" />
              {items.map((product) => (
                <th key={product.id} className="p-0 align-top border border-border bg-card">
                  <div className="relative flex flex-col">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <Link href={`/catalog/${product.id}`}>
                      <div className="aspect-square overflow-hidden border-b border-border bg-[#1a1a1a] flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="text-[#555] font-mono text-xs">Нет фото</div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4 text-left">
                      <div className="font-mono text-xs text-muted-foreground mb-1">{product.sku}</div>
                      <Link href={`/catalog/${product.id}`}>
                        <h3 className="font-serif font-bold text-sm uppercase leading-tight hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="mt-3 mb-4">
                        {product.oldPrice && (
                          <div className="font-mono text-xs line-through text-muted-foreground">
                            {product.oldPrice.toLocaleString("ru-RU")} ₽
                          </div>
                        )}
                        <div className="font-mono font-bold text-xl">
                          {product.price.toLocaleString("ru-RU")} ₽
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full rounded-none bg-accent text-white hover:bg-accent/90 uppercase font-mono text-xs gap-2 border-0"
                        onClick={() => addItem(product, 1)}
                      >
                        <ShoppingCart className="h-3 w-3" />
                        В корзину
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Specs body */}
          <tbody>
            {specRows.map((row, i) => {
              const highlight = hasHighlight(row);
              return (
                <tr
                  key={row.key}
                  className={cn(
                    i % 2 === 0 ? "bg-background" : "bg-card",
                    highlight && "bg-accent/5"
                  )}
                >
                  <td className="px-4 py-3 border border-border font-mono text-xs text-muted-foreground align-middle">
                    {row.key}
                  </td>
                  {row.values.map((val, j) => (
                    <td
                      key={j}
                      className={cn(
                        "px-4 py-3 border border-border font-mono text-sm text-center align-middle font-bold",
                        highlight && val ? "text-accent" : "text-primary",
                        !val && "text-muted-foreground font-normal"
                      )}
                    >
                      {val ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
