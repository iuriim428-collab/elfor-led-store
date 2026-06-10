import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { ArrowRight, Search, Download, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

  const [modalOpen, setModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descProductId, setDescProductId] = useState<number | null>(null);

  const { data: categories = [] } = useListCategories();
  const { data: products = [], isLoading } = useListProducts({
    search: search || undefined,
    categoryId: selectedCategory,
  });
  const descProduct = products.find(p => p.id === descProductId) ?? null;
  const { data: catalog } = useQuery<CatalogInfo>({
    queryKey: ["catalog"],
    queryFn: async () => (await fetch("/api/catalog")).json(),
    staleTime: 5 * 60 * 1000,
  });

  async function handleDownloadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phone.trim() || phone.trim().length < 6) {
      setError("Укажите телефон");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Укажите корректный email");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/catalog-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), email: email.trim() }),
      });
    } catch {
    } finally {
      setSubmitting(false);
    }
    setModalOpen(false);
    setPhone("");
    setEmail("");
    if (catalog?.objectPath) {
      const link = document.createElement("a");
      link.href = `/api/storage${catalog.objectPath}`;
      link.download = catalog.filename ?? "ELFOR-catalog.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

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
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" />
            Скачать каталог PDF
          </button>
        )}
      </div>

      {/* Download Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="rounded-none border border-border bg-background max-w-md p-0 overflow-hidden">
          <div className="bg-primary text-primary-foreground px-6 py-5">
            <DialogHeader>
              <DialogTitle className="font-serif font-black text-xl uppercase tracking-tight">
                Скачать каталог PDF
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/70 font-mono text-sm mt-1">
                Оставьте контакты — мы пришлём обновления каталога на ваш email
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleDownloadSubmit} className="px-6 py-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-phone" className="font-mono text-xs uppercase tracking-wider">
                Телефон <span className="text-accent">*</span>
              </Label>
              <Input
                id="lead-phone"
                type="tel"
                placeholder="+7 (999) 000-00-00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-none border-border font-mono h-12"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-email" className="font-mono text-xs uppercase tracking-wider">
                Email <span className="text-accent">*</span>
              </Label>
              <Input
                id="lead-email"
                type="email"
                placeholder="example@company.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none border-border font-mono h-12"
                required
              />
            </div>

            {error && (
              <p className="text-sm font-mono text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-none bg-accent text-white hover:bg-accent/90 font-bold uppercase tracking-wider h-12 gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Скачать
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-none border-border font-bold uppercase tracking-wider h-12 px-6"
              >
                Отмена
              </Button>
            </div>

            <p className="text-xs font-mono text-muted-foreground text-center leading-relaxed">
              Нажимая «Скачать», вы соглашаетесь с&nbsp;
              <Link href="/privacy" className="underline hover:text-primary">политикой конфиденциальности</Link>
            </p>
          </form>
        </DialogContent>
      </Dialog>

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
