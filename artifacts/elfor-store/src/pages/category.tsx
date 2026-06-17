import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
  
  const { data: categories = [] } = useListCategories();
  const category = categories.find(c => c.slug === slug);
  
  const { data: products = [], isLoading } = useListProducts({
    categoryId: category?.id,
  }, { query: { enabled: !!category } });

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
        <div className="flex flex-col gap-4">
          {products.map((product) => {
            const isStorageImg = product.imageUrl?.startsWith("/api/storage/");
            return (
              <Link key={product.id} href={`/catalog/${product.id}`} className="group flex flex-row border border-border bg-card hover-elevate">
                {/* Photo — fixed square */}
                <div className={`shrink-0 w-40 h-40 sm:w-52 sm:h-52 overflow-hidden flex items-center justify-center border-r border-border ${isStorageImg ? "bg-[#1a1a1a]" : "bg-white"}`}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className={`w-full h-full object-contain group-hover:scale-105 transition-transform ${isStorageImg ? "" : "mix-blend-multiply"}`} />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-mono text-xs">Нет фото</div>
                  )}
                </div>
                {/* Info — same height as photo */}
                <div className="flex flex-col flex-1 p-4 sm:p-6 justify-between min-w-0">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground mb-1">{product.sku}</div>
                    <h3 className="font-serif font-bold text-base sm:text-lg uppercase leading-tight mb-2 group-hover:text-accent transition-colors">{product.name}</h3>
                    {(product.fullDescription || product.shortDescription) && (
                      <button
                        className="text-xs font-mono text-accent underline underline-offset-2 hover:opacity-70 transition-opacity text-left w-fit"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDescProductId(product.id); }}
                      >
                        Описание
                      </button>
                    )}
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      {product.oldPrice && <div className="text-xs font-mono line-through text-muted-foreground">{product.oldPrice.toLocaleString("ru-RU")} ₽</div>}
                      <div className="font-mono font-bold text-xl">{product.price.toLocaleString("ru-RU")} ₽</div>
                    </div>
                    <Button size="icon" className="rounded-none border border-border bg-primary text-primary-foreground hover:bg-accent hover:border-accent hover:text-white transition-colors h-10 w-10 shrink-0">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            );
          })}
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