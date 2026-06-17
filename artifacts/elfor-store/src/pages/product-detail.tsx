import { useGetProduct } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useState, useEffect } from "react";
import { ShoppingCart, Check, ChevronRight, GitCompareArrows } from "lucide-react";
import { useComparison } from "@/hooks/use-comparison";
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
  const { toggleItem, isInComparison } = useComparison();
  
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedKelvin, setSelectedKelvin] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "desc">("specs");

  const colorTemps = (product?.colorTemps ?? []) as string[];
  const beamAngles = (product?.beamAngles ?? []) as string[];
  const variantStocks = (product?.variantStocks ?? []) as { kelvin: string; stock: number }[];

  const activeKelvin = selectedKelvin ?? (colorTemps[0] || null);
  const activeAngle = selectedAngle ?? (beamAngles[0] || null);

  const activeVariantStock = activeKelvin && variantStocks.length > 0
    ? variantStocks.find(v => v.kelvin === activeKelvin)
    : undefined;
  const displayStock = activeVariantStock !== undefined ? activeVariantStock.stock : (product?.stock ?? 0);
  const maxQty = displayStock > 0 ? displayStock : 999;

  useEffect(() => {
    setQuantity(q => Math.min(q, maxQty));
  }, [activeKelvin, maxQty]);

  if (isLoading) return <div className="p-12 text-center font-mono">Загрузка...</div>;
  if (!product) return <div className="p-12 text-center font-mono text-red-500">Товар не найден</div>;

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 mb-10 sm:mb-16">
        {/* Images */}
        {(() => {
          const isStorageImg = product.imageUrl?.startsWith("/api/storage/");
          return (
            <div className="flex justify-center items-start">
              <div
                className={`border border-border overflow-hidden w-fit ${isStorageImg ? "bg-[#1a1a1a]" : "bg-white"}`}
                style={{ minWidth: 160, minHeight: 160 }}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={`block max-h-[520px] max-w-full w-auto h-auto ${isStorageImg ? "" : "mix-blend-multiply"}`}
                  />
                ) : (
                  <div className="px-16 py-12 text-muted-foreground font-mono text-sm">Нет фото</div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Info */}
        <div className="flex flex-col">
          <div className="text-sm font-mono text-muted-foreground mb-3">{product.sku}</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black uppercase mb-5 sm:mb-6 leading-tight">{product.name}</h1>
          
          <div className="flex flex-wrap items-center gap-2 mb-6 font-mono text-xs font-bold uppercase tracking-wider">
            {displayStock > 0 ? (
              <span className="px-3 py-1 bg-green-500/10 text-green-700 border border-green-500/20">В наличии: {displayStock} шт</span>
            ) : (
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20">Под заказ</span>
            )}
            {product.warranty && <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20">Гарантия {product.warranty}</span>}
            <button
              onClick={() => product && toggleItem(product)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 border transition-colors font-mono text-xs uppercase",
                isInComparison(product.id)
                  ? "bg-accent border-accent text-white"
                  : "border-border text-muted-foreground hover:text-accent hover:border-accent"
              )}
            >
              <GitCompareArrows className="h-3 w-3" />
              {isInComparison(product.id) ? "В сравнении" : "Сравнить"}
            </button>
            {(product as { passportUrl?: string | null }).passportUrl ? (
              <a
                href={(product as { passportUrl?: string | null }).passportUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 border border-accent/40 text-accent hover:bg-accent/10 transition-colors ml-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Скачать паспорт
              </a>
            ) : (
              <span
                className="flex items-center gap-1.5 px-3 py-1 border border-dashed border-border text-muted-foreground ml-auto cursor-default select-none"
                title="Паспорт будет добавлен в ближайшее время"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Паспорт
              </span>
            )}
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
              <div className="flex items-center mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Угол свечения</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {beamAngles.map(a => (
                  <div
                    key={a}
                    className="px-4 py-3 border font-mono font-bold text-sm uppercase tracking-wide min-w-[60px] bg-muted text-muted-foreground border-border cursor-default select-none"
                  >
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-border bg-card p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-end gap-3 mb-5">
              <div className="font-mono font-bold text-3xl sm:text-4xl">{currentPrice.toLocaleString("ru-RU")} ₽</div>
              {product.oldPrice && <div className="text-base sm:text-lg font-mono line-through text-muted-foreground mb-1">{product.oldPrice.toLocaleString("ru-RU")} ₽</div>}
              <div className="text-xs font-mono text-muted-foreground mb-1 ml-auto">за штуку</div>
            </div>

            {product.priceTiers && product.priceTiers.length > 0 && (
              <div className="mb-5 font-mono text-sm border-t border-border pt-4">
                <div className="flex gap-4 sm:gap-6 flex-wrap">
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

            <div className="flex gap-3">
              <div className="w-28 sm:w-32 flex shrink-0">
                <Button 
                  variant="outline" 
                  className="rounded-none border-border px-3 font-mono"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >-</Button>
                <Input 
                  type="number" 
                  value={quantity} 
                  min={1}
                  max={maxQty}
                  onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="rounded-none border-x-0 border-border text-center font-mono focus-visible:ring-0"
                />
                <Button 
                  variant="outline" 
                  className="rounded-none border-border px-3 font-mono"
                  onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty && displayStock > 0}
                >+</Button>
              </div>
              <Button 
                className={`flex-1 rounded-none font-bold uppercase tracking-wider h-10 text-xs sm:text-sm ${added ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-accent hover:bg-accent/90 text-white'}`}
                onClick={handleAddToCart}
              >
                {added ? (
                  <><Check className="mr-1.5 h-4 w-4 shrink-0" /> В корзине</>
                ) : (
                  <><ShoppingCart className="mr-1.5 h-4 w-4 shrink-0" /><span className="hidden sm:inline">В корзину · </span>{(currentPrice * quantity).toLocaleString("ru-RU")} ₽</>
                )}
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
          <button
            onClick={() => setActiveTab("specs")}
            className={cn("px-6 py-4 border-r border-border transition-colors", activeTab === "specs" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary")}
          >
            Характеристики
          </button>
          {product.fullDescription && (
            <button
              onClick={() => setActiveTab("desc")}
              className={cn("px-6 py-4 transition-colors", activeTab === "desc" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary")}
            >
              Описание
            </button>
          )}
        </div>
        <div className="p-8">
          {activeTab === "specs" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-mono text-sm">
              {product.specs?.map((spec, i) => (
                <div key={i} className="flex justify-between border-b border-border border-dashed pb-2">
                  <span className="text-muted-foreground">{spec.key}</span>
                  <span className="font-bold text-right whitespace-nowrap">{spec.value}{spec.unit ? `\u00a0${spec.unit}` : ""}</span>
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
          ) : (
            <div className="font-mono text-sm text-foreground leading-relaxed whitespace-pre-line max-w-3xl">
              {product.fullDescription}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
