import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminBar } from "@/components/admin-bar";
import NotFound from "@/pages/not-found";

import { PublicLayout } from "@/components/layout/public-layout";
import { AdminLayout } from "@/components/layout/admin-layout";

import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Category from "@/pages/category";
import News from "@/pages/news";
import Article from "@/pages/article";
import About from "@/pages/about";
import Contacts from "@/pages/contacts";
import Cart from "@/pages/cart";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminProductForm from "@/pages/admin/product-form";
import AdminCategories from "@/pages/admin/categories";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderDetail from "@/pages/admin/order-detail";
import AdminArticles from "@/pages/admin/articles";
import AdminArticleForm from "@/pages/admin/article-form";
import AdminCatalog from "@/pages/admin/catalog";
import AdminDocuments from "@/pages/admin/documents";
import AdminSettings from "@/pages/admin/settings";
import AdminAnalytics from "@/pages/admin/analytics";

const queryClient = new QueryClient();

function AppContent() {
  const [location] = useLocation();
  const { isAdmin } = useAdminAuth();

  if (location === "/admin" || location.startsWith("/admin/")) {
    return (
      <WouterRouter base="/admin">
        <AdminLayout>
          <Switch>
            <Route path="/" component={AdminDashboard} />
            <Route path="/products/new" component={AdminProductForm} />
            <Route path="/products/:id" component={AdminProductForm} />
            <Route path="/products" component={AdminProducts} />
            <Route path="/categories" component={AdminCategories} />
            <Route path="/orders/:id" component={AdminOrderDetail} />
            <Route path="/orders" component={AdminOrders} />
            <Route path="/articles/new" component={AdminArticleForm} />
            <Route path="/articles/:id" component={AdminArticleForm} />
            <Route path="/articles" component={AdminArticles} />
            <Route path="/catalog" component={AdminCatalog} />
            <Route path="/documents" component={AdminDocuments} />
            <Route path="/settings" component={AdminSettings} />
            <Route path="/analytics" component={AdminAnalytics} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </WouterRouter>
    );
  }

  return (
    <>
      {/* Floating admin bar when logged in */}
      {isAdmin && <AdminBar />}
      {/* Push content down when admin bar is visible */}
      <div className={isAdmin ? "pt-9" : ""}>
        <PublicLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/catalog" component={Catalog} />
            <Route path="/catalog/:id" component={ProductDetail} />
            <Route path="/categories/:slug" component={Category} />
            <Route path="/news" component={News} />
            <Route path="/news/:id" component={Article} />
            <Route path="/about" component={About} />
            <Route path="/contacts" component={Contacts} />
            <Route path="/cart" component={Cart} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </div>
      {/* Login trigger when not logged in */}
      {!isAdmin && <AdminBar />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppContent />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
