import { useGetDashboardStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Package, ShoppingBag, MessageCircle, TrendingUp, ArrowRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  processing: "В работе",
  shipped: "Отгружен",
  delivered: "Доставлен",
  cancelled: "Отменён",
  archive: "Архив",
};

const STATUS_COLORS: Record<string, string> = {
  new: "#E8500B",
  processing: "#f59e0b",
  shipped: "#3b82f6",
  delivered: "#22c55e",
  cancelled: "#6b7280",
  archive: "#06b6d4",
};

function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={`border bg-card p-5 flex flex-col gap-3 ${accent ? "border-accent" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "text-accent" : "text-muted-foreground"}`} />
      </div>
      <div className={`text-2xl font-mono font-black ${accent ? "text-accent" : "text-primary"}`}>{value}</div>
      {sub && <div className="text-xs font-mono text-muted-foreground">{sub}</div>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-primary text-primary-foreground border border-border px-3 py-2 font-mono text-xs shadow-lg">
      <div className="font-bold mb-1">{label}</div>
      <div>Заказов: <span className="text-accent font-bold">{payload[0]?.value}</span></div>
      {payload[1] && (
        <div>Выручка: <span className="text-green-400 font-bold">{Number(payload[1]?.value).toLocaleString("ru-RU")} ₽</span></div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border bg-card p-5 h-28 animate-pulse bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }
  if (!stats) return null;

  const maxCount = Math.max(...(stats.ordersLast7Days?.map(d => d.count) ?? [1]), 1);

  return (
    <div className="flex flex-col gap-6">

      {/* Top row — 5 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Заказов сегодня"
          value={stats.todayOrders}
          sub={stats.todayRevenue > 0 ? `${stats.todayRevenue.toLocaleString("ru-RU")} ₽` : "нет продаж"}
          icon={ShoppingBag}
          accent={stats.todayOrders > 0}
        />
        <StatCard
          label="Новых (ожидают)"
          value={stats.newOrdersCount}
          sub={`Всего заказов: ${stats.totalOrders}`}
          icon={TrendingUp}
          accent={stats.newOrdersCount > 0}
        />
        <StatCard
          label="Выручка всего"
          value={`${stats.totalRevenue.toLocaleString("ru-RU")} ₽`}
          icon={TrendingUp}
        />
        <StatCard
          label="Активных чатов"
          value={stats.openChats}
          sub={stats.openChats > 0 ? "Посетители ждут ответа" : "нет обращений"}
          icon={MessageCircle}
          accent={stats.openChats > 0}
        />
        <StatCard
          label="Товаров"
          value={stats.totalProducts}
          sub={`Категорий: ${stats.totalCategories}`}
          icon={Package}
        />
      </div>

      {/* Middle row — chart + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* 7-day bar chart */}
        <div className="lg:col-span-3 border border-border bg-card flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="font-serif font-bold uppercase text-sm tracking-wider">Заказы — последние 7 дней</span>
          </div>
          <div className="flex-1 p-4" style={{ minHeight: 200 }}>
            {stats.ordersLast7Days && stats.ordersLast7Days.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.ordersLast7Days} barGap={4}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fill: "#888" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fill: "#888" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(43,45,43,0.06)" }} />
                  <Bar dataKey="count" name="Заказов" maxBarSize={40} radius={0}>
                    {stats.ordersLast7Days.map((entry, i) => (
                      <Cell
                        key={entry.date}
                        fill={entry.count === maxCount && entry.count > 0 ? "#E8500B" : "#D5D0C5"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center font-mono text-sm text-muted-foreground">
                Нет данных
              </div>
            )}
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 border border-border bg-card flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="font-serif font-bold uppercase text-sm tracking-wider">Последние заказы</span>
            <Link href="/orders" className="text-[10px] font-mono font-bold uppercase text-accent hover:underline flex items-center gap-1">
              Все <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {stats.recentOrders.length === 0 ? (
              <div className="p-5 text-sm font-mono text-muted-foreground">Нет заказов</div>
            ) : (
              stats.recentOrders.slice(0, 8).map(order => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="flex justify-between items-center px-5 py-3 hover:bg-muted/40 transition-colors cursor-pointer">
                    <div>
                      <div className="font-mono text-sm font-bold">#{order.id}</div>
                      <div className="font-mono text-[11px] text-muted-foreground truncate max-w-[120px]">{order.customerName}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm font-bold">{order.totalAmount.toLocaleString("ru-RU")} ₽</div>
                      <div
                        className="text-[10px] font-mono font-bold px-2 py-0.5 inline-block mt-0.5"
                        style={{ color: STATUS_COLORS[order.status] ?? "#888", background: `${STATUS_COLORS[order.status] ?? "#888"}18` }}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom row — status breakdown + active chats CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status breakdown */}
        <div className="border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <span className="font-serif font-bold uppercase text-sm tracking-wider">Распределение по статусам</span>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {stats.ordersByStatus.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">Нет данных</p>
            ) : (
              stats.ordersByStatus.map(s => {
                const pct = stats.totalOrders > 0 ? Math.round((s.count / stats.totalOrders) * 100) : 0;
                const color = STATUS_COLORS[s.status] ?? "#aaa";
                return (
                  <div key={s.status} className="flex items-center gap-3">
                    <div className="w-24 font-mono text-xs shrink-0" style={{ color }}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </div>
                    <div className="flex-1 h-2 bg-muted overflow-hidden">
                      <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="font-mono text-xs text-right w-14 shrink-0 text-muted-foreground">
                      {s.count} <span className="text-[10px]">({pct}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active chats card */}
        <div className={`border bg-card flex flex-col ${stats.openChats > 0 ? "border-green-500/40" : "border-border"}`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <MessageCircle className={`h-4 w-4 ${stats.openChats > 0 ? "text-green-500" : "text-muted-foreground"}`} />
            <span className="font-serif font-bold uppercase text-sm tracking-wider">Онлайн-чат</span>
            {stats.openChats > 0 && (
              <span className="ml-auto w-6 h-6 rounded-full bg-green-500 text-white text-[11px] font-bold flex items-center justify-center">
                {stats.openChats}
              </span>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            {stats.openChats > 0 ? (
              <>
                <div className="text-4xl font-mono font-black text-green-500">{stats.openChats}</div>
                <p className="font-mono text-sm text-muted-foreground">
                  {stats.openChats === 1 ? "Посетитель ждёт ответа" : "Посетителей ждут ответа"}
                </p>
                <Link href="/chat">
                  <button className="bg-green-500 hover:bg-green-600 text-white font-bold font-mono text-xs uppercase tracking-wider px-6 py-2.5 transition-colors">
                    Открыть чат →
                  </button>
                </Link>
              </>
            ) : (
              <>
                <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
                <p className="font-mono text-sm text-muted-foreground">Активных обращений нет</p>
                <Link href="/chat">
                  <span className="font-mono text-xs text-accent hover:underline cursor-pointer">История диалогов →</span>
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
