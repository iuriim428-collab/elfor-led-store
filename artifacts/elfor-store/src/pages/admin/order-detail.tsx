import { useGetOrder, useUpdateOrder, useSendInvoice } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, FileText, Loader2, Upload, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const orderId = parseInt(id!);
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } });
  const updateOrder = useUpdateOrder();
  const sendInvoice = useSendInvoice();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [invoiceSentAt, setInvoiceSentAt] = useState<Date | null>(null);

  const handleInvoiceUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      // 1. Request presigned URL
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/pdf" }),
      });
      if (!urlRes.ok) throw new Error("Ошибка получения URL");
      const { uploadURL, objectPath } = await urlRes.json();

      // 2. Upload file directly to presigned URL
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/pdf" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Ошибка загрузки файла");

      // 3. Save objectPath to order
      const updated = await updateOrder.mutateAsync({ id: orderId, data: { invoiceFilePath: objectPath } });
      // Directly push updated data into the React Query cache — no refetch needed
      queryClient.setQueryData([`/api/orders/${orderId}`], updated);
      toast({ title: "Счёт загружен", description: file.name });
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err?.message ?? "Попробуйте ещё раз", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveInvoice = async () => {
    const updated = await updateOrder.mutateAsync({ id: orderId, data: { invoiceFilePath: null } });
    queryClient.setQueryData([`/api/orders/${orderId}`], updated);
    toast({ title: "Счёт удалён" });
  };

  const STATUS_LABELS: Record<string, string> = {
    new: "Новый",
    processing: "В работе",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменён",
    archive: "Архив",
  };

  const handleStatusChange = (status: any) => {
    updateOrder.mutate({ id: orderId, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
        queryClient.refetchQueries({ queryKey: [`/api/orders/${orderId}`] });
        if (status !== "archive") {
          toast({
            title: "Статус обновлён",
            description: `Уведомление отправлено клиенту`,
          });
        }
      },
      onError: () => {
        toast({ title: "Ошибка", description: "Не удалось обновить статус", variant: "destructive" });
      }
    });
  };

  const handleSendInvoice = () => {
    sendInvoice.mutate({ id: orderId }, {
      onSuccess: (data) => {
        if (data.ok) {
          setInvoiceSentAt(new Date());
          toast({ title: "Счёт отправлен", description: `На почту ${order?.customerEmail}` });
        } else {
          toast({
            title: "Счёт не отправлен",
            description: data.message ?? "Проверьте настройки SMTP",
            variant: "destructive",
          });
        }
      },
      onError: () => {
        toast({ title: "Ошибка отправки", description: "Проверьте настройки SMTP", variant: "destructive" });
      }
    });
  };

  if (isLoading) return <div className="font-mono p-6">Загрузка...</div>;
  if (!order) return <div className="font-mono p-6 text-destructive">Заказ не найден</div>;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/orders">
          <Button variant="outline" size="icon" className="rounded-none border-border h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="font-serif font-bold text-lg uppercase">Заказ #{order.id}</h2>
        <span className="font-mono text-sm text-muted-foreground">
          от {new Date(order.createdAt).toLocaleString('ru-RU')}
        </span>

        {/* Action buttons */}
        <div className="ml-auto flex gap-3">
          <Button
            variant="outline"
            className="rounded-none border-border font-mono text-xs uppercase h-9 gap-2"
            onClick={handleSendInvoice}
            disabled={sendInvoice.isPending}
          >
            {sendInvoice.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <FileText className="h-4 w-4" />}
            Выставить счёт
          </Button>
          <a href={`mailto:${order.customerEmail}`}>
            <Button variant="outline" className="rounded-none border-border font-mono text-xs uppercase h-9 gap-2">
              <Mail className="h-4 w-4" />
              Написать
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="border border-border bg-card p-6">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
              <h3 className="font-serif font-bold uppercase text-sm">Состав заказа</h3>
              <div className="font-mono font-bold text-lg">{order.totalAmount.toLocaleString("ru-RU")} ₽</div>
            </div>
            
            <div className="flex flex-col gap-4 font-mono text-sm">
              {order.items.map((item, i) => (
                <div key={i} className="pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">{item.productSku}</div>
                      <Link href={`/catalog/${item.productId}`} className="font-bold hover:text-accent" target="_blank">
                        {item.productName}
                      </Link>
                      {/* Selected options */}
                      {(item.selectedKelvin || item.selectedAngle) && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {item.selectedKelvin && (
                            <span className="px-2 py-0.5 border border-border text-[10px] font-bold uppercase bg-primary text-primary-foreground">
                              ЦТ: {item.selectedKelvin}
                            </span>
                          )}
                          {item.selectedAngle && (
                            <span className="px-2 py-0.5 border border-border text-[10px] font-bold uppercase bg-primary text-primary-foreground">
                              Угол: {item.selectedAngle}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <div className="whitespace-nowrap">{item.quantity} шт × {item.unitPrice.toLocaleString("ru-RU")} ₽</div>
                      <div className="font-bold mt-1">{(item.quantity * item.unitPrice).toLocaleString("ru-RU")} ₽</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-border bg-card p-6">
            <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-4 mb-4">Статус</h3>
            <Select value={order.status} onValueChange={handleStatusChange} disabled={updateOrder.isPending}>
              <SelectTrigger className="w-full rounded-none border-border font-mono font-bold uppercase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="rounded-none border-border font-mono text-sm uppercase">
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val} textValue={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] font-mono text-muted-foreground mt-2">
              {order.status === "archive"
                ? "Статус «Архив» — уведомление клиенту не отправляется"
                : "При смене статуса клиент получит уведомление на email"}
            </p>
          </div>

          <div className="border border-border bg-card p-6">
            <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-4 mb-4">Клиент</h3>
            <div className="flex flex-col gap-4 font-mono text-sm">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">ФИО</div>
                <div className="font-bold">{order.customerName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">Телефон</div>
                <a href={`tel:${order.customerPhone}`} className="text-accent hover:underline">{order.customerPhone}</a>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">Email</div>
                <a href={`mailto:${order.customerEmail}`} className="text-accent hover:underline">{order.customerEmail}</a>
              </div>
              {order.customerCompany && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Компания</div>
                  <div>{order.customerCompany}</div>
                </div>
              )}
              {order.deliveryAddress && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Адрес</div>
                  <div>{order.deliveryAddress}</div>
                </div>
              )}
              {order.comment && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Комментарий</div>
                  <div className="p-3 bg-muted border border-border whitespace-pre-wrap">{order.comment}</div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice action card */}
          <div className="border border-accent/40 bg-orange-50/30 p-6">
            <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-4 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              Счёт на оплату
            </h3>

            {/* Uploaded invoice file */}
            {order.invoiceFilePath ? (
              <div className="mb-4 p-3 border border-border bg-background flex items-center gap-3">
                <FileText className="h-5 w-5 text-accent shrink-0" />
                <span className="font-mono text-xs flex-1 truncate text-muted-foreground">Счёт загружен</span>
                <a
                  href={`/api/storage/objects${order.invoiceFilePath.replace(/^\/objects/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:text-accent transition-colors"
                  title="Скачать"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={handleRemoveInvoice}
                  className="p-1.5 hover:text-destructive transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="font-mono text-xs text-muted-foreground mb-3">Файл счёта не загружен</p>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleInvoiceUpload(f); }}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-none border-dashed font-mono text-[10px] uppercase min-h-9 h-auto py-2 gap-1.5 whitespace-normal leading-tight mb-3 transition-colors"
              style={order.invoiceFilePath ? {
                borderColor: "#16a34a",
                backgroundColor: "#f0fdf4",
                color: "#15803d",
              } : undefined}
            >
              {uploading
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> Загрузка...</>
                : order.invoiceFilePath
                  ? <><Upload className="h-3.5 w-3.5 shrink-0" /> Счёт загружен</>
                  : <><Upload className="h-3.5 w-3.5 shrink-0" /> Загрузить счёт</>}
            </Button>

            {/* Send invoice by email */}
            <p className="font-mono text-[10px] text-muted-foreground mb-3">
              {order.invoiceFilePath
                ? "Файл счёта готов к отправке"
                : "Загрузите файл счёта чтобы отправить клиенту"}
            </p>
            <Button
              className="w-full rounded-none font-bold uppercase tracking-tight min-h-10 h-auto py-2.5 bg-accent hover:bg-accent/90 text-white text-[10px] gap-1.5 whitespace-normal leading-tight disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSendInvoice}
              disabled={sendInvoice.isPending || !order.invoiceFilePath}
            >
              {sendInvoice.isPending
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> Отправка...</>
                : <><Mail className="h-3.5 w-3.5 shrink-0" /> Отправить счёт клиенту</>}
            </Button>
            {invoiceSentAt && (
              <p className="font-mono text-[9px] text-green-600 mt-1.5">
                ✓ Отправлен {invoiceSentAt.toLocaleString("ru-RU")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
