import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, FileText, Store, LogOut, BookOpen, FileArchive, Settings, BarChart2, MessageCircle, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useOpenChats } from "@/hooks/use-open-chats";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAdmin, logout } = useAdminAuth();
  const openChats = useOpenChats();

  const navigation = [
    { name: "Дашборд", href: "/", icon: LayoutDashboard, exact: true },
    { name: "Заказы", href: "/orders", icon: ShoppingBag },
    { name: "Товары", href: "/products", icon: Package },
    { name: "Категории", href: "/categories", icon: FolderTree },
    { name: "Статьи", href: "/articles", icon: FileText },
    { name: "Каталог PDF", href: "/catalog", icon: BookOpen },
    { name: "Документы", href: "/documents", icon: FileArchive },
    { name: "Аналитика", href: "/analytics", icon: BarChart2 },
    { name: "Чат", href: "/chat", icon: MessageCircle, badge: openChats },
    { name: "Расчёты освещения", href: "/calc-requests", icon: Calculator },
    { name: "Настройки", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground border-r border-border flex flex-col fixed h-full z-10">
        <div className="h-20 flex items-center px-6 border-b border-primary-foreground/10">
          <Link href="/" className="font-serif font-black text-xl tracking-tighter text-white">
            ELFOR ADMIN
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = item.exact 
              ? location === item.href 
              : location.startsWith(item.href);
              
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors",
                  isActive 
                    ? "bg-accent text-white" 
                    : "text-primary-foreground/70 hover:text-white hover:bg-primary-foreground/5"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/10 flex flex-col gap-1">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary-foreground/70 hover:text-white hover:bg-primary-foreground/5 transition-colors"
          >
            <Store className="h-5 w-5" />
            В магазин
          </a>
          {isAdmin && (
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary-foreground/50 hover:text-white hover:bg-primary-foreground/5 transition-colors w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              Выйти из сессии
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-background border-b border-border flex items-center px-8 sticky top-0 z-10">
          <h1 className="text-xl font-serif font-bold uppercase tracking-wider">
            {navigation.find(item => item.exact ? location === item.href : location.startsWith(item.href))?.name || "Панель управления"}
          </h1>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
