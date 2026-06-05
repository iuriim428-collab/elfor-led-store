import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { ArrowRight, Search, Download, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface CatalogInfo {
  objectPath: string | null;
  filename: string | null;
}

export default function Catalog() {
  const [searchParams] = useSearch();
  const searchObj = new URLSearchParams(searchParams);
  const initialSearch = searchObj.get("search") || "";
  const categoryIdParam = searchObj.get("categoryId");

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    categoryIdParam ? parseInt(categoryIdParam) : undefined
  );

  const { data: categories = [] } = useListCategories();
  const { data: products = [], isLoading } = useListProducts({
    search: search || undefined,
    categoryId: selectedCategory,
  });
  const { data: catalog } = useQuery<CatalogInfo>({
    queryKey: ["catalog"],
    queryFn: async () => (await fetch("/api/catalog")).json(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span>/</span>
        <span className="text-primary">Каталог</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <h1 className="text-4xl font-serif font-black uppercase">Каталог</h1>
        {catalog?.objectPath && (
          <a
            href={`/api/storage${catalog.objectPath}`}
            download={catalog.filename ?? "ELFOR-catalog.pdf"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" />
            Скачать каталог PDF
          </a>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-8">
          <div>
            <h3 className="font-serif font-bold uppercase mb-4 text-sm tracking-widest flex items-center gap-2">
              <Search className="h-4 w-4" /> Поиск
            </h3>
            <Input 
              placeholder="Артикул или название" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-none border-border font-mono text-sm h-12"
            />
          </div>

          <div>
            <h3 className="font-serif font-bold uppercase mb-4 text-sm tracking-widest flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Категории
            </h3>
            <div className="flex flex-col gap-2 font-mono text-sm">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={cn(
                  "text-left px-3 py-2 border border-transparent hover:border-border transition-colors",
                  selectedCategory === undefined ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground"
                )}
              >
                Все категории
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "text-left px-3 py-2 border border-transparent hover:border-border transition-colors",
                    selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center border border-border bg-card">
              <h3 className="font-serif font-bold text-xl uppercase mb-2">Товары не найдены</h3>
              <p className="font-mono text-sm text-muted-foreground">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}