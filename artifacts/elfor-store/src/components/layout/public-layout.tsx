import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart, Menu, X, Phone, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useListCategories } from "@workspace/api-client-react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { totalItems, totalPrice } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: categories = [] } = useListCategories();

  const navLinks = [
    { href: "/catalog", label: "Каталог" },
    { href: "/about", label: "О компании" },
    { href: "/news", label: "Новости" },
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-accent selection:text-white">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-xs font-mono border-b border-border hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <a href="tel:+78000000000" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Phone className="h-3 w-3" />
              <span>8 (800) 000-00-00</span>
            </a>
            <a href="mailto:info@lfour.ru" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Mail className="h-3 w-3" />
              <span>info@lfour.ru</span>
            </a>
          </div>
          <div className="flex gap-4 opacity-80">
            <span>Пн-Пт 9:00-18:00</span>
            <span>Доставка по всей России</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif font-black text-2xl tracking-tighter text-primary">
              ЭЛФОР
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors hover:text-accent",
                    location.startsWith(link.href) ? "text-accent" : "text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="outline" className="hidden md:flex gap-2 rounded-none border-border font-mono">
                <ShoppingCart className="h-4 w-4" />
                <span>{totalPrice.toLocaleString("ru-RU")} ₽</span>
                {totalItems > 0 && (
                  <span className="bg-accent text-white px-2 py-0.5 text-xs">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/cart" className="md:hidden relative">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block p-4 border border-border font-serif uppercase text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground border-t border-border pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <Link href="/" className="font-serif font-black text-2xl tracking-tighter mb-6 block">
                ЭЛФОР
              </Link>
              <p className="text-sm text-primary-foreground/60 mb-6 font-mono leading-relaxed">
                Российский производитель промышленных светодиодных светильников. 
                Высокая энергоэффективность и гарантия качества.
              </p>
            </div>
            
            <div>
              <h3 className="font-serif font-bold uppercase mb-6 text-sm tracking-widest">Каталог</h3>
              <ul className="flex flex-col gap-3 text-sm text-primary-foreground/60">
                {categories.slice(0, 5).map(cat => (
                  <li key={cat.id}>
                    <Link href={`/categories/${cat.slug}`} className="hover:text-accent transition-colors flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      {cat.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/catalog" className="text-accent hover:text-white transition-colors flex items-center gap-2 mt-2">
                    Смотреть все
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif font-bold uppercase mb-6 text-sm tracking-widest">Компания</h3>
              <ul className="flex flex-col gap-3 text-sm text-primary-foreground/60">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-serif font-bold uppercase mb-6 text-sm tracking-widest">Контакты</h3>
              <ul className="flex flex-col gap-4 text-sm font-mono text-primary-foreground/80">
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-accent shrink-0" />
                  <div>
                    <a href="tel:+78000000000" className="block hover:text-accent">8 (800) 000-00-00</a>
                    <span className="text-xs text-primary-foreground/50 mt-1 block">Бесплатно по РФ</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-accent shrink-0" />
                  <a href="mailto:info@lfour.ru" className="hover:text-accent">info@lfour.ru</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-primary-foreground/40">
            <p>© {new Date().getFullYear()} ЭЛФОР. Все права защищены.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-accent">Политика конфиденциальности</a>
              <a href="#" className="hover:text-accent">Договор оферты</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
