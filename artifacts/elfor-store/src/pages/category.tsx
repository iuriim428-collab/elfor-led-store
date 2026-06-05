import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Category() {
  const { slug } = useParams();
  
  const { data: categories = [] } = useListCategories();
  const category = categories.find(c => c.slug === slug);
  
  const { data: products = [], isLoading } = useListProducts({
    categoryId: category?.id,
  }, { query: { enabled: !!category } });

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
              <div className="aspect-square p-4 flex items-center justify-center border-b border-border bg-white relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-mono text-xs">Нет фото</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs font-mono text-muted-foreground mb-2">{product.sku}</div>
                <h3 className="font-serif font-bold text-sm uppercase leading-tight mb-4 flex-1 group-hover:text-accent transition-colors">{product.name}</h3>
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    {product.oldPrice && <div className="text-xs font-mono line-through text-muted-foreground">{product.oldPrice.toLocaleString("ru-RU")} ₽</div>}
                    <div className="font-mono font-bold text-lg">{product.price.toLocaleString("ru-RU")} ₽</div>
                  </div>
                  <Button size="icon" className="rounded-none border border-border bg-primary text-primary-foreground hover:bg-accent hover:border-accent hover:text-white transition-colors h-10 w-10">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}