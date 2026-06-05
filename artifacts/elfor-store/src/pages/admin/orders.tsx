import { useListOrders, useUpdateOrder } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useListOrders();
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();

  const handleStatusChange = (id: number, status: any) => {
    updateOrder.mutate({ id, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-serif font-bold text-lg uppercase">Заказы ({orders.length})</h2>

      <div className="border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border">
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground w-16">ID</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Дата</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Клиент</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Сумма</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-sm">
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Загрузка...</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Нет заказов</TableCell></TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="border-border">
                  <TableCell className="text-muted-foreground">#{order.id}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    <div className="font-bold">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                  </TableCell>
                  <TableCell className="font-bold">{order.totalAmount.toLocaleString("ru-RU")} ₽</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                      <SelectTrigger className="w-[140px] h-8 rounded-none border-border text-xs font-mono font-bold uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-border font-mono text-xs uppercase">
                        <SelectItem value="new">Новый</SelectItem>
                        <SelectItem value="processing">В работе</SelectItem>
                        <SelectItem value="shipped">Отправлен</SelectItem>
                        <SelectItem value="delivered">Доставлен</SelectItem>
                        <SelectItem value="cancelled">Отменен</SelectItem>
                      </SelectContent>
                    </Select>
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