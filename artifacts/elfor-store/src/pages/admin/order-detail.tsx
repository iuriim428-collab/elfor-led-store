import { useGetOrder, useUpdateOrder } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const orderId = parseInt(id!);
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } });
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();

  const handleStatusChange = (status: any) => {
    updateOrder.mutate({ id: orderId, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] })
    });
  };

  if (isLoading) return <div className="font-mono p-6">Загрузка...</div>;
  if (!order) return <div className="font-mono p-6 text-destructive">Заказ не найден</div>;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="outline" size="icon" className="rounded-none border-border h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="font-serif font-bold text-lg uppercase">Заказ #{order.id}</h2>
        <span className="font-mono text-sm text-muted-foreground ml-auto">
          от {new Date(order.createdAt).toLocaleString('ru-RU')}
        </span>
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
                <div key={i} className="flex justify-between items-center pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">{item.productSku}</div>
                    <Link href={`/catalog/${item.productId}`} className="font-bold hover:text-accent" target="_blank">
                      {item.productName}
                    </Link>
                  </div>
                  <div className="text-right ml-4">
                    <div className="whitespace-nowrap">{item.quantity} шт × {item.unitPrice.toLocaleString("ru-RU")} ₽</div>
                    <div className="font-bold mt-1">{(item.quantity * item.unitPrice).toLocaleString("ru-RU")} ₽</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-border bg-card p-6">
            <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-4 mb-4">Статус</h3>
            <Select value={order.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full rounded-none border-border font-mono font-bold uppercase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-border font-mono text-sm uppercase">
                <SelectItem value="new">Новый</SelectItem>
                <SelectItem value="processing">В работе</SelectItem>
                <SelectItem value="shipped">Отправлен</SelectItem>
                <SelectItem value="delivered">Доставлен</SelectItem>
                <SelectItem value="cancelled">Отменен</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </div>
    </div>
  );
}