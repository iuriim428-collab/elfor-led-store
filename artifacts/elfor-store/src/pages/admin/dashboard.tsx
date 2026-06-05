import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, DollarSign, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) return <div className="font-mono">Загрузка...</div>;
  if (!stats) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-none border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-bold uppercase text-muted-foreground">Всего заказов</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{stats.totalOrders}</div>
            <p className="text-xs font-mono text-muted-foreground mt-1">Новых: <span className="text-accent font-bold">{stats.newOrdersCount}</span></p>
          </CardContent>
        </Card>
        
        <Card className="rounded-none border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-bold uppercase text-muted-foreground">Выручка</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{stats.totalRevenue.toLocaleString("ru-RU")} ₽</div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-bold uppercase text-muted-foreground">Товары</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{stats.totalProducts}</div>
            <p className="text-xs font-mono text-muted-foreground mt-1">Категорий: {stats.totalCategories}</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-bold uppercase text-muted-foreground">Статьи</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold">{stats.totalArticles}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border bg-muted/50 font-serif font-bold uppercase text-sm tracking-wider">
            Последние заказы
          </div>
          <div className="p-0">
            {stats.recentOrders.length === 0 ? (
              <div className="p-4 text-sm font-mono text-muted-foreground">Нет заказов</div>
            ) : (
              <div className="flex flex-col">
                {stats.recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-4 border-b border-border last:border-0 text-sm font-mono">
                    <div>
                      <div className="font-bold">#{order.id}</div>
                      <div className="text-muted-foreground text-xs">{order.customerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{order.totalAmount.toLocaleString("ru-RU")} ₽</div>
                      <div className="text-xs px-2 py-0.5 bg-muted border border-border inline-block mt-1">
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border bg-muted/50 font-serif font-bold uppercase text-sm tracking-wider">
            Статусы заказов
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-3 font-mono text-sm">
              {stats.ordersByStatus.map(status => (
                <div key={status.status} className="flex justify-between items-center">
                  <span>{status.status}</span>
                  <span className="font-bold bg-muted px-2 py-1 border border-border min-w-[2rem] text-center">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}