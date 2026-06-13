import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, ShoppingBag, Banknote, BarChart2, MapPin, Package } from "lucide-react";

interface Summary {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  statusCounts: Record<string, number>;
}
interface TopProduct { sku: string; name: string; total_qty: number; total_revenue: number; orders_count: number }
interface MonthRow { month: string; label: string; orders: number; revenue: number }
interface CityRow { city: string; count: number; revenue: number }
interface Analytics {
  summary: Summary;
  topProducts: TopProduct[];
  monthly: MonthRow[];
  cities: CityRow[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новый", confirmed: "Подтверждён", shipped: "Отправлен",
  delivered: "Доставлен", cancelled: "Отменён",
};
const STATUS_COLORS: Record<string, string> = {
  new: "#E8500B", confirmed: "#f97316", shipped: "#3b82f6",
  delivered: "#22c55e", cancelled: "#6b7280",
};
const CHART_COLORS = ["#E8500B", "#2B2D2B", "#3b82f6", "#f97316", "#22c55e", "#a855f7", "#ec4899"];

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="border border-border bg-card p-6 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-wider">
        <Icon className="h-4 w-4 text-accent" />
        {label}
      </div>
      <div className="font-mono font-black text-3xl">{value}</div>
      {sub && <div className="text-xs font-mono text-muted-foreground">{sub}</div>}
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString("ru-RU");

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: () => fetch("/api/analytics").then(r => r.json()),
    staleTime: 60_000,
  });

  if (isLoading || !data) {
    return <div className="font-mono text-sm text-muted-foreground animate-pulse">Загрузка аналитики...</div>;
  }

  const { summary, topProducts, monthly, cities } = data;

  const statusData = Object.entries(summary.statusCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v, color: STATUS_COLORS[k] ?? "#999" }));

  const maxQty = Math.max(...topProducts.map(p => p.total_qty), 1);

  return (
    <div className="flex flex-col gap-8 max-w-6xl">

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag}  label="Заказов"          value={fmt(summary.totalOrders)} />
        <StatCard icon={Banknote}     label="Выручка"          value={`${fmt(summary.totalRevenue)} ₽`} />
        <StatCard icon={TrendingUp}   label="Средний чек"      value={`${fmt(summary.avgOrderValue)} ₽`} />
        <StatCard icon={BarChart2}    label="Позиций продано"   value={fmt(topProducts.reduce((s, p) => s + Number(p.total_qty), 0))} />
      </div>

      {/* Monthly revenue + order status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <div className="lg:col-span-2 border border-border bg-card p-6 flex flex-col gap-4">
          <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-3">Выручка по месяцам</h3>
          {monthly.length === 0 ? (
            <p className="text-muted-foreground font-mono text-sm">Нет данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "monospace" }} tickFormatter={v => `${(v/1000).toFixed(0)}к`} />
                <Tooltip
                  formatter={(v: number) => [`${fmt(v)} ₽`, "Выручка"]}
                  contentStyle={{ fontFamily: "monospace", fontSize: 12, border: "1px solid #ccc" }}
                />
                <Bar dataKey="revenue" fill="#E8500B" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status pie */}
        <div className="border border-border bg-card p-6 flex flex-col gap-4">
          <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-3">Статусы заказов</h3>
          {statusData.length === 0 ? (
            <p className="text-muted-foreground font-mono text-sm">Нет данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${value}`} labelLine={false}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconType="square" iconSize={10} formatter={(v) => <span style={{ fontSize: 11, fontFamily: "monospace" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top products + cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top products */}
        <div className="border border-border bg-card p-6 flex flex-col gap-4">
          <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-accent" /> Топ товаров по количеству
          </h3>
          <div className="flex flex-col gap-3">
            {topProducts.slice(0, 8).map((p, i) => (
              <div key={p.sku} className="flex flex-col gap-1">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="truncate max-w-[70%]">
                    <span className="text-accent font-bold mr-1">{p.sku}</span>
                    <span className="text-muted-foreground">{p.name.replace(/^[A-ZА-Я0-9]+\s*[—–]\s*/, "")}</span>
                  </span>
                  <span className="font-bold shrink-0 ml-2">{fmt(Number(p.total_qty))} шт.</span>
                </div>
                <div className="h-2 bg-muted overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${Math.round((Number(p.total_qty) / maxQty) * 100)}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  {fmt(Number(p.total_revenue))} ₽ · {p.orders_count} {p.orders_count === 1 ? "заказ" : "заказа"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div className="border border-border bg-card p-6 flex flex-col gap-4">
          <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" /> Регионы доставки
          </h3>
          {cities.length === 0 ? (
            <p className="text-muted-foreground font-mono text-sm">Нет данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={cities.slice(0, 8)}
                margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
              >
                <XAxis type="number" tick={{ fontSize: 11, fontFamily: "monospace" }} allowDecimals={false} />
                <YAxis type="category" dataKey="city" width={110} tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip
                  formatter={(v: number, name) => [name === "count" ? `${v} заказ(а)` : `${fmt(v)} ₽`, name === "count" ? "Заказов" : "Выручка"]}
                  contentStyle={{ fontFamily: "monospace", fontSize: 12, border: "1px solid #ccc" }}
                />
                <Bar dataKey="count" fill="#2B2D2B" radius={0} label={{ position: "right", fontSize: 11, fontFamily: "monospace", formatter: (v: number) => `${v} шт` }} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {cities.length > 0 && (
            <div className="border-t border-border pt-3 grid grid-cols-2 gap-1 font-mono text-xs">
              {cities.slice(0, 6).map(c => (
                <div key={c.city} className="flex justify-between gap-2 text-muted-foreground">
                  <span className="truncate">{c.city}</span>
                  <span className="font-bold text-primary shrink-0">{fmt(Math.round(c.revenue))} ₽</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full products table */}
      <div className="border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-serif font-bold uppercase text-sm">Все продажи по артикулам</h3>
        </div>
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="bg-muted text-xs uppercase border-b border-border">
              <th className="text-left px-4 py-3 text-muted-foreground">Артикул</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Наименование</th>
              <th className="text-right px-4 py-3 text-muted-foreground">Заказов</th>
              <th className="text-right px-4 py-3 text-muted-foreground">Кол-во шт.</th>
              <th className="text-right px-4 py-3 text-muted-foreground">Выручка</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={p.sku} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/30"}`}>
                <td className="px-4 py-3 font-bold text-accent">{p.sku}</td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[300px]">{p.name.replace(/^[A-ZА-Я0-9]+\s*[—–]\s*/, "")}</td>
                <td className="px-4 py-3 text-right">{p.orders_count}</td>
                <td className="px-4 py-3 text-right font-bold">{fmt(Number(p.total_qty))}</td>
                <td className="px-4 py-3 text-right font-bold">{fmt(Number(p.total_revenue))} ₽</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted border-t border-border font-bold">
              <td colSpan={3} className="px-4 py-3 text-xs uppercase text-muted-foreground">Итого</td>
              <td className="px-4 py-3 text-right text-accent">{fmt(topProducts.reduce((s, p) => s + Number(p.total_qty), 0))}</td>
              <td className="px-4 py-3 text-right text-accent">{fmt(topProducts.reduce((s, p) => s + Number(p.total_revenue), 0))} ₽</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
