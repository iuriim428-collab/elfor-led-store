import { useListOrders } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation } from "wouter";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  processing: "В работе",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
  archive: "Архив",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-orange-100 text-orange-800 border-orange-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  archive: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useListOrders();
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered = activeFilter === "all" ? orders : orders.filter(o => o.status === activeFilter);

  const countByStatus = (status: string) => orders.filter(o => o.status === status).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-lg uppercase">Заказы ({filtered.length})</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1 border text-[11px] font-mono font-bold uppercase transition-colors ${
            activeFilter === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          Все ({orders.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([val, label]) => {
          const count = countByStatus(val);
          const isActive = activeFilter === val;
          return (
            <button
              key={val}
              onClick={() => setActiveFilter(val)}
              className={`px-3 py-1 border text-[11px] font-mono font-bold uppercase transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      <div className="border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border">
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground w-16">ID</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Дата</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Клиент</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Состав</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Сумма</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-sm">
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Загрузка...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Нет заказов с таким статусом</TableCell></TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow
                  key={order.id}
                  className="border-border cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setLocation(`/orders/${order.id}`)}
                >
                  <TableCell className="text-muted-foreground font-bold">#{order.id}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    <div className="font-bold">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                    {(order.items as any[]).map((it: any, i: number) => (
                      <div key={i} className="truncate">{it.productSku} × {it.quantity}</div>
                    ))}
                  </TableCell>
                  <TableCell className="font-bold">{order.totalAmount.toLocaleString("ru-RU")} ₽</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${STATUS_COLORS[order.status] ?? "bg-muted"}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
