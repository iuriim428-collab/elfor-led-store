import { useGetOrder, useUpdateOrder, useSendInvoice } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const orderId = parseInt(id!);
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } });
  const updateOrder = useUpdateOrder();
  const sendInvoice = useSendInvoice();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
            <p className="font-mono text-xs text-muted-foreground mb-4">
              Отправить счёт на оплату на почту клиента ({order.customerEmail})
            </p>
            <Button
              className="w-full rounded-none font-bold uppercase tracking-wider h-10 bg-accent hover:bg-accent/90 text-white text-xs gap-2"
              onClick={handleSendInvoice}
              disabled={sendInvoice.isPending}
            >
              {sendInvoice.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Отправка...</>
                : <><FileText className="h-4 w-4" /> Отправить счёт</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
