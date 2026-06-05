import { useListFeaturedProducts, useListCategories, useListArticles } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, Factory, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: featuredProducts = [], isLoading: isLoadingProducts } = useListFeaturedProducts();
  const { data: categories = [] } = useListCategories();
  const { data: articles = [] } = useListArticles({ type: "news", limit: 3, published: true });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-24 lg:py-32 relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black uppercase tracking-tight mb-6 leading-[1.1]">
              Промышленные<br />
              <span className="text-accent">LED светильники</span><br />
              от производителя
            </h1>
            <p className="text-lg md:text-xl font-mono text-primary-foreground/80 mb-10 max-w-2xl leading-relaxed">
              Надежные решения для заводов, складов и улиц. Энергоэффективность до 200 лм/Вт. Гарантия 5 лет.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/catalog">
                <Button size="lg" className="bg-accent text-white hover:bg-accent/90 border border-accent rounded-none font-bold uppercase tracking-wider text-sm h-14 px-8">
                  Перейти в каталог
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-none font-bold uppercase tracking-wider text-sm h-14 px-8">
                  О компании
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Stats / Why Us */}
      <section className="py-16 border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col border border-border p-6 hover-elevate bg-card">
              <Factory className="h-10 w-10 text-accent mb-4" />
              <h3 className="font-serif font-bold text-xl uppercase mb-2">Собственное производство</h3>
              <p className="text-sm font-mono text-muted-foreground">Контроль качества на всех этапах изготовления</p>
            </div>
            <div className="flex flex-col border border-border p-6 hover-elevate bg-card">
              <Shield className="h-10 w-10 text-accent mb-4" />
              <h3 className="font-serif font-bold text-xl uppercase mb-2">Гарантия 5 лет</h3>
              <p className="text-sm font-mono text-muted-foreground">Безусловная гарантия на всю продукцию ELFOR</p>
            </div>
            <div className="flex flex-col border border-border p-6 hover-elevate bg-card">
              <Zap className="h-10 w-10 text-accent mb-4" />
              <h3 className="font-serif font-bold text-xl uppercase mb-2">До 200 лм/Вт</h3>
              <p className="text-sm font-mono text-muted-foreground">Максимальная энергоэффективность на рынке</p>
            </div>
            <div className="flex flex-col border border-border p-6 hover-elevate bg-card">
              <Award className="h-10 w-10 text-accent mb-4" />
              <h3 className="font-serif font-bold text-xl uppercase mb-2">ГОСТ и Сертификаты</h3>
              <p className="text-sm font-mono text-muted-foreground">Полное соответствие российским стандартам</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-black uppercase">Категории</h2>
            <Link href="/catalog" className="hidden md:flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-accent hover:text-primary transition-colors">
              Все категории <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className="group block border border-border bg-background overflow-hidden hover-elevate">
                <div className="aspect-[4/3] bg-muted relative p-6 flex flex-col justify-end">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent z-10" />
                  {cat.imageUrl && (
                    <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50 group-hover:scale-105 transition-transform duration-700" />
                  )}
                  <h3 className="relative z-20 text-white font-serif font-bold text-xl uppercase">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 border-b border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-black uppercase">Популярные модели</h2>
          </div>

          {isLoadingProducts ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/catalog/${product.id}`} className="group flex flex-col border border-border bg-card hover-elevate h-full">
                  <div className="aspect-square p-4 flex items-center justify-center border-b border-border bg-white relative">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-mono text-xs">Нет фото</div>
                    )}
                    {product.stock > 0 ? (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/10 text-green-700 border border-green-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">В наличии</div>
                    ) : (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">Под заказ</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-xs font-mono text-muted-foreground mb-2">{product.sku}</div>
                    <h3 className="font-serif font-bold text-sm uppercase leading-tight mb-4 flex-1 group-hover:text-accent transition-colors">{product.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-4 font-mono text-[10px] text-muted-foreground">
                      {product.power && <span className="px-2 py-1 bg-muted border border-border">{product.power} Вт</span>}
                      {product.lumens && <span className="px-2 py-1 bg-muted border border-border">{product.lumens} лм</span>}
                    </div>
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
      </section>

      {/* News Preview */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-black uppercase">Новости</h2>
            <Link href="/news" className="hidden md:flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-accent hover:text-primary transition-colors">
              Все новости <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/news/${article.id}`} className="group flex flex-col border border-border bg-background hover-elevate">
                {article.imageUrl && (
                  <div className="aspect-video border-b border-border overflow-hidden bg-muted">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-mono text-accent mb-3">{new Date(article.createdAt).toLocaleDateString('ru-RU')}</div>
                  <h3 className="font-serif font-bold text-lg uppercase leading-tight mb-3 group-hover:text-accent transition-colors">{article.title}</h3>
                  {article.excerpt && <p className="text-sm font-mono text-muted-foreground line-clamp-3">{article.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}