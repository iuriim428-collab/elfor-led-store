import { useGetProduct } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { ShoppingCart, Check, ChevronRight } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const productId = parseInt(id!);
  
  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  const { addItem } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) return <div className="p-12 text-center font-mono">Загрузка...</div>;
  if (!product) return <div className="p-12 text-center font-mono text-red-500">Товар не найден</div>;

  const handleAddToCart = () => {
    addItem(product, quantity);
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
          
          <div className="flex flex-wrap gap-2 mb-8 font-mono text-xs font-bold uppercase tracking-wider">
            {product.stock > 0 ? (
              <span className="px-3 py-1 bg-green-500/10 text-green-700 border border-green-500/20">В наличии: {product.stock} шт</span>
            ) : (
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20">Под заказ</span>
            )}
            {product.warranty && <span className="px-3 py-1 bg-accent/10 text-accent border border-accent/20">Гарантия {product.warranty}</span>}
          </div>

          <div className="border border-border bg-card p-6 mb-8">
            <div className="flex items-end gap-4 mb-6">
              <div className="font-mono font-bold text-4xl">{currentPrice.toLocaleString("ru-RU")} ₽</div>
              {product.oldPrice && <div className="text-lg font-mono line-through text-muted-foreground mb-1">{product.oldPrice.toLocaleString("ru-RU")} ₽</div>}
            </div>

            {product.priceTiers && product.priceTiers.length > 0 && (
              <div className="mb-6 font-mono text-sm border-t border-border pt-4">
                <div className="text-muted-foreground mb-2">Оптовые цены:</div>
                <div className="flex flex-col gap-1">
                  {product.priceTiers.map(tier => (
                    <div key={tier.minQty} className="flex justify-between">
                      <span>от {tier.minQty} шт</span>
                      <span className="font-bold">{tier.price.toLocaleString("ru-RU")} ₽/шт</span>
                    </div>
                  ))}
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
                {added ? <><Check className="mr-2 h-4 w-4" /> В корзине</> : <><ShoppingCart className="mr-2 h-4 w-4" /> В корзину</>}
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
            {/* Built-in specs */}
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