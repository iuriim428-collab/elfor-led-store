import { lazy, Suspense, type ComponentType } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { ComparisonProvider } from "@/hooks/use-comparison";
import { ComparisonBar } from "@/components/comparison-bar";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminBar } from "@/components/admin-bar";
import NotFound from "@/pages/not-found";

import { PublicLayout } from "@/components/layout/public-layout";
import { AdminLayout } from "@/components/layout/admin-layout";

const queryClient = new QueryClient();

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  );
}

function lazyRoute<TModule extends { default: ComponentType<any> }>(
  loader: () => Promise<TModule>,
) {
  const LazyComponent = lazy(loader);

  return function LazyRouteComponent() {
    return (
      <Suspense fallback={<PageFallback />}>
        <LazyComponent />
      </Suspense>
    );
  };
}

const Home = lazyRoute(() => import("@/pages/home"));
const Catalog = lazyRoute(() => import("@/pages/catalog"));
const ProductDetail = lazyRoute(() => import("@/pages/product-detail"));
const Category = lazyRoute(() => import("@/pages/category"));
const News = lazyRoute(() => import("@/pages/news"));
const Article = lazyRoute(() => import("@/pages/article"));
const About = lazyRoute(() => import("@/pages/about"));
const Contacts = lazyRoute(() => import("@/pages/contacts"));
const Cart = lazyRoute(() => import("@/pages/cart"));
const Compare = lazyRoute(() => import("@/pages/compare"));

const AdminDashboard = lazyRoute(() => import("@/pages/admin/dashboard"));
const AdminProducts = lazyRoute(() => import("@/pages/admin/products"));
const AdminProductForm = lazyRoute(() => import("@/pages/admin/product-form"));
const AdminCategories = lazyRoute(() => import("@/pages/admin/categories"));
const AdminOrders = lazyRoute(() => import("@/pages/admin/orders"));
const AdminOrderDetail = lazyRoute(() => import("@/pages/admin/order-detail"));
const AdminArticles = lazyRoute(() => import("@/pages/admin/articles"));
const AdminArticleForm = lazyRoute(() => import("@/pages/admin/article-form"));
const AdminCatalog = lazyRoute(() => import("@/pages/admin/catalog"));
const AdminDocuments = lazyRoute(() => import("@/pages/admin/documents"));
const AdminSettings = lazyRoute(() => import("@/pages/admin/settings"));
const AdminAnalytics = lazyRoute(() => import("@/pages/admin/analytics"));
const AdminChat = lazyRoute(() => import("@/pages/admin/chat"));
const AdminCalcRequests = lazyRoute(() => import("@/pages/admin/calc-requests"));

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
            <Route path="/chat" component={AdminChat} />
            <Route path="/calc-requests" component={AdminCalcRequests} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </WouterRouter>
    );
  }

  return (
    <>
      {isAdmin && <AdminBar />}
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
            <Route path="/compare" component={Compare} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </div>
      {!isAdmin && <AdminBar />}
      <ComparisonBar />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <CartProvider>
          <ComparisonProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AppContent />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </ComparisonProvider>
        </CartProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
