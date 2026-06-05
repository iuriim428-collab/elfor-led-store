import { useGetProduct } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { ShoppingCart, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const KELVIN_LABELS: Record<string, string> = {
  "3000K": "ТЁПЛЫЙ",
  "3500K": "ТЁПЛЫЙ",
  "4000K": "БЕЛЫЙ",
  "4500K": "БЕЛЫЙ",
  "5000K": "НЕЙТРАЛЬНЫЙ",
  "5500K": "НЕЙТРАЛЬНЫЙ",
  "6000K": "ХОЛОДНЫЙ",
  "6500K": "ХОЛОДНЫЙ",
};

export default function ProductDetail() {
  const { id } = useParams();
  const productId = parseInt(id!);
  
  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  const { addItem } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedKelvin, setSelectedKelvin] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);

  if (isLoading) return <div className="p-12 text-center font-mono">Загрузка...</div>;
  if (!product) return <div className="p-12 text-center font-mono text-red-500">Товар не найден</div>;

  const colorTemps = (product.colorTemps ?? []) as string[];
  const beamAngles = (product.beamAngles ?? []) as string[];

  const activeKelvin = selectedKelvin ?? (colorTemps[0] || null);
  const activeAngle = selectedAngle ?? (beamAngles[0] || null);

  const handleAddToCart = () => {
    addItem(product, quantity, activeKelvin, activeAngle);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Determine current price based on quantity and tiers
  let currentPrice = product.price;
  if (product.priceTiers && product.priceTiers.length > 0) {
    const sortedTiers = [...product.priceTiers].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sortedTiers) {
      if (quantity >= tier.minQty) {
        currentPrice = tier.price;
        break;
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalog" className="hover:text-primary">Каталог</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-primary truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="border border-border bg-white p-8 flex items-center justify-center min-h-[400px]">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-[500px] object-contain mix-blend-multiply" />
          ) : (
            <div className="text-muted-foreground font-mono">Нет фото</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="text-sm font-mono text-muted-foreground mb-4">{product.sku}</div>
          <h1 className="text-3xl md:text-4xl font-serif font-black uppercase mb-6 leading-tight">{product.name}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6 font-mono text-xs font-bold uppercase tracking-wider">
            {product.stock > 0 ? (
              <span className="px-3 py-1 bg-green-500/10 text-green-700 border border-green-500/20">В наличии: {product.stock} шт</span>
            ) : (
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20">Под заказ</span>
            )}
            {product.warranty && <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20">Гарантия {product.warranty}</span>}
          </div>

          {/* Color temperature selector */}
          {colorTemps.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Цветовая температура</span>
                {activeKelvin && (
                  <span className="font-mono text-xs font-bold text-primary">
                    {activeKelvin} · {KELVIN_LABELS[activeKelvin] ?? ""}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {colorTemps.map(k => (
                  <button
                    key={k}
                    onClick={() => setSelectedKelvin(k)}
                    className={cn(
                      "px-4 py-3 border font-mono font-bold text-sm uppercase tracking-wide transition-colors",
                      activeKelvin === k
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-primary border-border hover:border-primary/50"
                    )}
                  >
                    <div>{k}</div>
                    {KELVIN_LABELS[k] && (
                      <div className={cn("text-[9px] font-normal tracking-wider mt-0.5", activeKelvin === k ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {KELVIN_LABELS[k]}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Beam angle selector */}
          {beamAngles.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Угол свечения</span>
                {activeAngle && (
                  <span className="font-mono text-xs font-bold text-primary">{activeAngle}</span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {beamAngles.map(a => (
                  <button
                    key={a}
                    onClick={() => setSelectedAngle(a)}
                    className={cn(
                      "px-4 py-3 border font-mono font-bold text-sm uppercase tracking-wide transition-colors min-w-[60px]",
                      activeAngle === a
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-primary border-border hover:border-primary/50"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border border-border bg-card p-6 mb-8">
            <div className="flex items-end gap-4 mb-6">
              <div className="font-mono font-bold text-4xl">{currentPrice.toLocaleString("ru-RU")} ₽</div>
              {product.oldPrice && <div className="text-lg font-mono line-through text-muted-foreground mb-1">{product.oldPrice.toLocaleString("ru-RU")} ₽</div>}
              <div className="text-xs font-mono text-muted-foreground mb-1 ml-auto">за штуку</div>
            </div>

            {product.priceTiers && product.priceTiers.length > 0 && (
              <div className="mb-6 font-mono text-sm border-t border-border pt-4">
                <div className="flex gap-6 flex-wrap">
                  {product.priceTiers.map(tier => {
                    const disc = Math.round((1 - tier.price / product.price) * 100);
                    return (
                      <div key={tier.minQty} className="text-center">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">от {tier.minQty} шт</div>
                        <div className="font-bold">{tier.price.toLocaleString("ru-RU")} ₽</div>
                        {disc > 0 && <div className="text-[10px] text-accent font-bold">-{disc}%</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <div className="w-32 flex">
                <Button 
                  variant="outline" 
                  className="rounded-none border-border px-3 font-mono"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >-</Button>
                <Input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="rounded-none border-x-0 border-border text-center font-mono focus-visible:ring-0"
                />
                <Button 
                  variant="outline" 
                  className="rounded-none border-border px-3 font-mono"
                  onClick={() => setQuantity(q => q + 1)}
                >+</Button>
              </div>
              <Button 
                className={`flex-1 rounded-none font-bold uppercase tracking-wider h-10 ${added ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-accent hover:bg-accent/90 text-white'}`}
                onClick={handleAddToCart}
              >
                {added ? <><Check className="mr-2 h-4 w-4" /> В корзине</> : <><ShoppingCart className="mr-2 h-4 w-4" /> В корзину · {currentPrice.toLocaleString("ru-RU")} ₽</>}
              </Button>
            </div>
          </div>

          {product.shortDescription && (
            <div className="font-mono text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </div>
          )}
        </div>
      </div>

      {/* Tabs / Specs */}
      <div className="border border-border bg-card">
        <div className="flex border-b border-border font-serif font-bold uppercase text-sm tracking-wider">
          <div className="px-6 py-4 bg-primary text-primary-foreground border-r border-border">Характеристики</div>
          {product.fullDescription && <div className="px-6 py-4 text-muted-foreground cursor-not-allowed">Описание</div>}
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-mono text-sm">
            {product.specs?.map((spec, i) => (
              <div key={i} className="flex justify-between border-b border-border border-dashed pb-2">
                <span className="text-muted-foreground">{spec.key}</span>
                <span className="font-bold text-right">{spec.value} {spec.unit || ""}</span>
              </div>
            ))}
            {product.power && (
              <div className="flex justify-between border-b border-border border-dashed pb-2">
                <span className="text-muted-foreground">Мощность</span>
                <span className="font-bold text-right">{product.power} Вт</span>
              </div>
            )}
            {product.lumens && (
              <div className="flex justify-between border-b border-border border-dashed pb-2">
                <span className="text-muted-foreground">Световой поток</span>
                <span className="font-bold text-right">{product.lumens} лм</span>
              </div>
            )}
            {product.colorTemp && (
              <div className="flex justify-between border-b border-border border-dashed pb-2">
                <span className="text-muted-foreground">Цветовая температура</span>
                <span className="font-bold text-right">{product.colorTemp}</span>
              </div>
            )}
            {product.ipRating && (
              <div className="flex justify-between border-b border-border border-dashed pb-2">
                <span className="text-muted-foreground">Степень защиты</span>
                <span className="font-bold text-right">{product.ipRating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
