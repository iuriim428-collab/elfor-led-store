import {
  getListProductsQueryKey,
  useListProducts,
  useListCategories,
} from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowRight, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useComparison } from "@/hooks/use-comparison";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Category() {
  const { slug } = useParams();
  const [descProductId, setDescProductId] = useState<number | null>(null);
  const { toggleItem, isInComparison, isFull } = useComparison();
  
  const { data: categories = [] } = useListCategories();
  const category = categories.find(c => c.slug === slug);
  
  const { data: products = [], isLoading } = useListProducts({
    categoryId: category?.id,
  }, {
    query: {
      enabled: !!category,
      queryKey: getListProductsQueryKey({ categoryId: category?.id }),
    },
  });

  const descProduct = products.find(p => p.id === descProductId) ?? null;

  if (!category) {
    return <div className="p-24 text-center font-mono text-muted-foreground">Категория не найдена</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-primary">Каталог</Link>
        <span>/</span>
        <span className="text-primary">{category.name}</span>
      </div>

      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-black uppercase mb-6 leading-tight">{category.name}</h1>
        {category.description && (
          <p className="font-mono text-muted-foreground max-w-3xl leading-relaxed">{category.description}</p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center border border-border bg-card">
          <h3 className="font-serif font-bold text-xl uppercase mb-2">В этой категории пока нет товаров</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/catalog/${product.id}`} className="group flex flex-col border border-border bg-card hover-elevate h-full">
              <div className="aspect-square overflow-hidden flex items-center justify-center border-b border-border relative bg-[#1a1a1a]">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#555] font-mono text-xs">Нет фото</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs font-mono text-muted-foreground mb-2">{product.sku}</div>
                <h3 className="font-serif font-bold text-sm uppercase leading-tight mb-2 flex-1 group-hover:text-accent transition-colors">{product.name}</h3>
                {(product.fullDescription || product.shortDescription) && (
                  <button
                    className="text-xs font-mono text-accent underline underline-offset-2 hover:opacity-70 transition-opacity mb-3 text-left w-fit"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDescProductId(product.id); }}
                  >
                    Описание
                  </button>
                )}
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    {product.oldPrice && <div className="text-xs font-mono line-through text-muted-foreground">{product.oldPrice.toLocaleString("ru-RU")} ₽</div>}
                    <div className="font-mono font-bold text-lg">{product.price.toLocaleString("ru-RU")} ₽</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(product); }}
                      title={isInComparison(product.id) ? "Убрать из сравнения" : isFull ? "Максимум 4 товара" : "Добавить к сравнению"}
                      className={`h-10 w-10 flex items-center justify-center border transition-colors ${
                        isInComparison(product.id)
                          ? "bg-accent border-accent text-white"
                          : isFull
                          ? "border-border bg-card text-muted-foreground cursor-not-allowed opacity-50"
                          : "border-border bg-card text-muted-foreground hover:text-accent hover:border-accent"
                      }`}
                    >
                      <GitCompareArrows className="h-4 w-4" />
                    </button>
                    <Button size="icon" className="rounded-none border border-border bg-primary text-primary-foreground hover:bg-accent hover:border-accent hover:text-white transition-colors h-10 w-10">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={!!descProductId} onOpenChange={(open) => !open && setDescProductId(null)}>
        <DialogContent className="max-w-2xl rounded-none border border-border">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold uppercase text-lg leading-tight">{descProduct?.name}</DialogTitle>
            <DialogDescription className="font-mono text-xs text-muted-foreground">{descProduct?.sku}</DialogDescription>
          </DialogHeader>
          <div className="font-mono text-sm text-foreground leading-relaxed whitespace-pre-line">
            {descProduct?.fullDescription || descProduct?.shortDescription || "Описание отсутствует"}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
