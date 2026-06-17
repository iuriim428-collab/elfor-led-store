import { useListCalcRequests, useUpdateCalcRequestStatus } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Phone, User, Package, Clock, CheckCircle, RefreshCw } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  processing: "В работе",
  done: "Выполнена",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-orange-100 text-orange-800 border-orange-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  done: "bg-green-100 text-green-800 border-green-200",
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminCalcRequests() {
  const { data: requests = [], isLoading, refetch } = useListCalcRequests();
  const { mutate: updateStatus } = useUpdateCalcRequestStatus();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered = activeFilter === "all" ? requests : requests.filter(r => r.status === activeFilter);
  const newCount = requests.filter(r => r.status === "new").length;

  function handleStatusChange(id: number, status: string) {
    updateStatus({ id, data: { status } }, { onSuccess: () => refetch() });
  }

  if (isLoading) {
    return <div className="font-mono text-sm text-muted-foreground p-8">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-lg uppercase">
          Заявки на расчёт
          {newCount > 0 && (
            <span className="ml-2 bg-accent text-white text-xs font-mono px-2 py-0.5">{newCount} новых</span>
          )}
        </h2>
        <button
          onClick={() => refetch()}
          className="font-mono text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Обновить
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[["all", `Все (${requests.length})`], ["new", `Новые (${requests.filter(r=>r.status==="new").length})`], ["processing", `В работе (${requests.filter(r=>r.status==="processing").length})`], ["done", `Выполнены (${requests.filter(r=>r.status==="done").length})`]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setActiveFilter(val)}
            className={`px-3 py-1 border text-[11px] font-mono font-bold uppercase transition-colors ${
              activeFilter === val
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-border bg-card p-12 text-center">
          <p className="font-mono text-sm text-muted-foreground">Заявок нет</p>
        </div>
      ) : (
        <div className="border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-12">#</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> Контакт</span>
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3" /> Товар</span>
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Дата</span>
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Статус</TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => (
                <TableRow key={req.id} className={`border-b border-border ${req.status === "new" ? "bg-accent/5" : ""}`}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{req.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {req.name && <span className="font-mono text-xs font-bold">{req.name}</span>}
                      <a href={`tel:${req.phone}`} className="font-mono text-sm text-accent flex items-center gap-1 hover:underline">
                        <Phone className="h-3 w-3" /> {req.phone}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    {req.productName ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs">{req.productName}</span>
                        {req.productSku && <span className="font-mono text-[10px] text-muted-foreground">{req.productSku}</span>}
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(req.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 border text-[10px] font-mono font-bold uppercase ${STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                      {STATUS_LABELS[req.status] ?? req.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {req.status !== "processing" && req.status !== "done" && (
                        <button
                          onClick={() => handleStatusChange(req.id, "processing")}
                          className="px-2 py-1 border border-border text-[10px] font-mono hover:border-primary hover:text-primary transition-colors uppercase"
                        >
                          В работу
                        </button>
                      )}
                      {req.status !== "done" && (
                        <button
                          onClick={() => handleStatusChange(req.id, "done")}
                          className="px-2 py-1 border border-green-300 text-green-700 text-[10px] font-mono hover:bg-green-50 transition-colors uppercase flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" /> Готово
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
