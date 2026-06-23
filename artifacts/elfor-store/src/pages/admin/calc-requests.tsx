import { useListCalcRequests, useUpdateCalcRequestStatus, useUpdateCalcRequestFile, useSendCalcFile } from "@workspace/api-client-react";
import { Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { Phone, Mail, User, Package, Clock, RefreshCw, Upload, Send, Download, Trash2, ChevronDown, ChevronUp, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useQueryClient } from "@tanstack/react-query";

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

async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/pdf" }),
  });
  if (!res.ok) throw new Error("Не удалось получить URL для загрузки");
  return res.json();
}

async function uploadToStorage(uploadURL: string, file: File): Promise<void> {
  const res = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/pdf" },
    body: file,
  });
  if (!res.ok) throw new Error("Ошибка загрузки файла");
}

interface RowDetailProps {
  req: {
    id: number;
    name?: string | null;
    phone: string;
    email?: string | null;
    productId?: number | null;
    productSku?: string | null;
    productName?: string | null;
    status: string;
    calcFileUrl?: string | null;
    createdAt: string;
  };
  onUpdated: () => void;
}

function RowDetail({ req, onUpdated }: RowDetailProps) {
  const { toast } = useToast();
  const { password } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const { mutate: updateStatus } = useUpdateCalcRequestStatus();
  const { mutate: updateFile } = useUpdateCalcRequestFile();
  const { mutate: sendFile } = useSendCalcFile();

  function handleStatusChange(status: string) {
    updateStatus({ id: req.id, data: { status } }, {
      onSuccess: () => { onUpdated(); toast({ title: "Статус обновлён" }); },
      onError: () => toast({ title: "Ошибка", variant: "destructive" }),
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl(file);
      await uploadToStorage(uploadURL, file);
      updateFile({ id: req.id, data: { calcFileUrl: objectPath } }, {
        onSuccess: () => { onUpdated(); toast({ title: "Файл загружен", description: file.name }); },
        onError: () => toast({ title: "Ошибка сохранения", variant: "destructive" }),
      });
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err?.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemoveFile() {
    updateFile({ id: req.id, data: { calcFileUrl: null } }, {
      onSuccess: () => { onUpdated(); toast({ title: "Файл удалён" }); },
    });
  }

  function handleSendFile() {
    setSending(true);
    sendFile({ id: req.id }, {
      onSuccess: (result: any) => {
        setSending(false);
        if (result.ok) {
          onUpdated();
          toast({ title: "Расчёт отправлен", description: `На адрес ${req.email}` });
        } else {
          toast({ title: "Ошибка отправки", description: result.message, variant: "destructive" });
        }
      },
      onError: () => { setSending(false); toast({ title: "Ошибка отправки", variant: "destructive" }); },
    });
  }

  return (
    <div className="bg-muted/30 border-t border-border p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Status */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Статус заявки</div>
        <Select value={req.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="rounded-none border-border font-mono text-sm h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="new" className="font-mono text-sm">Новая</SelectItem>
            <SelectItem value="processing" className="font-mono text-sm">В работе</SelectItem>
            <SelectItem value="done" className="font-mono text-sm">Выполнена</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* File upload */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Файл расчёта</div>
        {req.calcFileUrl ? (
          <div className="flex items-center gap-2">
            <a
              href={`/api${req.calcFileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-green-300 text-green-700 text-xs font-mono hover:bg-green-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Скачать файл
            </a>
            <button
              onClick={handleRemoveFile}
              className="p-1.5 border border-border text-muted-foreground hover:border-red-300 hover:text-red-600 transition-colors"
              title="Удалить файл"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
              id={`file-upload-${req.id}`}
            />
            <label
              htmlFor={`file-upload-${req.id}`}
              className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-border text-xs font-mono text-muted-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? "Загрузка..." : "Загрузить файл"}
            </label>
          </div>
        )}
      </div>

      {/* Send to client */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Отправить клиенту</div>
        {req.email ? (
          <div className="flex flex-col gap-2">
            <div className="font-mono text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> {req.email}
            </div>
            <button
              onClick={handleSendFile}
              disabled={!req.calcFileUrl || sending}
              className="flex items-center gap-2 px-3 py-1.5 border border-accent text-accent text-xs font-mono font-bold uppercase hover:bg-accent hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {sending ? "Отправка..." : "Отправить расчёт"}
            </button>
            {!req.calcFileUrl && (
              <p className="font-mono text-[10px] text-muted-foreground">Сначала загрузите файл расчёта</p>
            )}
          </div>
        ) : (
          <p className="font-mono text-xs text-muted-foreground">Email не указан</p>
        )}
      </div>
    </div>
  );
}

export default function AdminCalcRequests() {
  const { data: requests = [], isLoading, refetch } = useListCalcRequests();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = activeFilter === "all" ? requests : requests.filter(r => r.status === activeFilter);
  const newCount = requests.filter(r => r.status === "new").length;

  function handleUpdated() {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["/api/calc-requests"] });
  }

  if (isLoading) {
    return <div className="font-mono text-sm text-muted-foreground p-8">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-lg uppercase flex items-center gap-3">
          Заявки на расчёт
          {newCount > 0 && (
            <span className="bg-accent text-white text-xs font-mono px-2 py-0.5">{newCount} новых</span>
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
        {[
          ["all", `Все (${requests.length})`],
          ["new", `Новые (${requests.filter(r => r.status === "new").length})`],
          ["processing", `В работе (${requests.filter(r => r.status === "processing").length})`],
          ["done", `Выполнены (${requests.filter(r => r.status === "done").length})`],
        ].map(([val, label]) => (
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
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-10">#</TableHead>
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
                <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Файл</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => {
                const isExpanded = expandedId === req.id;
                return (
                  <Fragment key={req.id}>
                    <TableRow
                      className={`border-b border-border cursor-pointer hover:bg-muted/20 transition-colors ${req.status === "new" ? "bg-accent/5" : ""} ${isExpanded ? "bg-muted/30" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">{req.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {req.name && <span className="font-mono text-xs font-bold">{req.name}</span>}
                          <a
                            href={`tel:${req.phone}`}
                            onClick={e => e.stopPropagation()}
                            className="font-mono text-sm text-accent flex items-center gap-1 hover:underline"
                          >
                            <Phone className="h-3 w-3" /> {req.phone}
                          </a>
                          {req.email && (
                            <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                              <Mail className="h-2.5 w-2.5" /> {req.email}
                            </span>
                          )}
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
                        {req.calcFileUrl ? (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-green-600">
                            <CheckCircle className="h-3 w-3" /> Загружен
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        }
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="p-0 border-b border-border">
                          <RowDetail req={req} onUpdated={handleUpdated} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
