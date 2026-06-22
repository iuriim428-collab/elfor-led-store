import { useCart, getApplicablePrice } from "@/hooks/use-cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerCompany: "",
    deliveryAddress: "",
    comment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    createOrder.mutate({
      data: {
        ...formData,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productSku: item.product.sku,
          quantity: item.quantity,
          unitPrice: getApplicablePrice(item.product, item.quantity),
          selectedKelvin: item.selectedKelvin ?? undefined,
          selectedAngle: item.selectedAngle ?? undefined,
        }))
      }
    }, {
      onSuccess: () => {
        toast({ title: "Заказ оформлен", description: "Мы свяжемся с вами в ближайшее время" });
        clearCart();
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Ошибка", description: "Не удалось оформить заказ", variant: "destructive" });
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <h1 className="text-3xl font-serif font-black uppercase mb-6">Корзина пуста</h1>
        <p className="font-mono text-muted-foreground mb-8">Вы еще ничего не добавили в корзину.</p>
        <Link href="/catalog">
          <Button className="w-full rounded-none font-bold uppercase tracking-wider h-12 bg-accent hover:bg-accent/90">
            Перейти в каталог
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-black uppercase mb-12">Оформление заказа</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="border border-border bg-card p-6">
            <h2 className="font-serif font-bold uppercase text-lg mb-6 border-b border-border pb-4">Состав заказа</h2>
            
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.cartKey} className="flex flex-col sm:flex-row gap-6 border-b border-border/50 pb-6 last:border-0 last:pb-0">
                  <div className="w-24 h-24 border border-border bg-white flex items-center justify-center shrink-0 p-2">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground">Нет фото</span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-xs font-mono text-muted-foreground mb-1">{item.product.sku}</div>
                    <Link href={`/catalog/${item.product.id}`} className="font-serif font-bold text-sm uppercase hover:text-accent transition-colors mb-2">
                      {item.product.name}
                    </Link>
                    {/* Selected options */}
                    {(item.selectedKelvin || item.selectedAngle) && (
                      <div className="flex gap-2 flex-wrap mb-2">
                        {item.selectedKelvin && (
                          <span className="px-2 py-0.5 border border-border font-mono text-[10px] font-bold uppercase bg-primary text-primary-foreground">
                            {item.selectedKelvin}
                          </span>
                        )}
                        {item.selectedAngle && (
                          <span className="px-2 py-0.5 border border-border font-mono text-[10px] font-bold uppercase bg-primary text-primary-foreground">
                            {item.selectedAngle}
                          </span>
                        )}
                      </div>
                    )}
                    {(() => {
                      const unitPrice = getApplicablePrice(item.product, item.quantity);
                      const isDiscounted = unitPrice < item.product.price;
                      const nextTier = item.product.priceTiers
                        ?.filter(t => t.minQty > item.quantity)
                        .sort((a, b) => a.minQty - b.minQty)[0];
                      return (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            {isDiscounted && (
                              <span className="font-mono text-xs line-through text-muted-foreground">{item.product.price.toLocaleString("ru-RU")} ₽</span>
                            )}
                            <span className={`font-mono font-bold text-base ${isDiscounted ? "text-accent" : ""}`}>
                              {unitPrice.toLocaleString("ru-RU")} ₽/шт
                            </span>
                            {isDiscounted && (
                              <span className="font-mono text-[10px] font-bold text-accent bg-accent/10 px-1 py-0.5">
                                −{Math.round((1 - unitPrice / item.product.price) * 100)}%
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            Итого: {(unitPrice * item.quantity).toLocaleString("ru-RU")} ₽
                          </div>
                          {nextTier && (
                            <div className="font-mono text-[10px] text-muted-foreground">
                              Ещё {nextTier.minQty - item.quantity} шт → {nextTier.price.toLocaleString("ru-RU")} ₽/шт
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end justify-between">
                    <div className="flex items-center">
                      <Button variant="outline" className="h-8 w-8 p-0 rounded-none border-border" onClick={() => updateQuantity(item.cartKey, Math.max(1, item.quantity - 1))}>-</Button>
                      <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.cartKey, Math.max(1, parseInt(e.target.value) || 1))} className="h-8 w-16 rounded-none border-x-0 border-border text-center font-mono text-sm px-1 focus-visible:ring-0" />
                      <Button variant="outline" className="h-8 w-8 p-0 rounded-none border-border" onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}>+</Button>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none" onClick={() => removeItem(item.cartKey)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="border border-border bg-card p-6 sticky top-24">
            <h2 className="font-serif font-bold uppercase text-lg mb-6 border-b border-border pb-4">Контактные данные</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="font-mono text-xs font-bold uppercase text-muted-foreground">ФИО / Контактное лицо *</Label>
                <Input id="customerName" required className="rounded-none border-border font-mono text-sm h-10" value={formData.customerName} onChange={e => setFormData(p => ({...p, customerName: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="font-mono text-xs font-bold uppercase text-muted-foreground">Телефон *</Label>
                <Input id="customerPhone" type="tel" required className="rounded-none border-border font-mono text-sm h-10" value={formData.customerPhone} onChange={e => setFormData(p => ({...p, customerPhone: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail" className="font-mono text-xs font-bold uppercase text-muted-foreground">Email *</Label>
                <Input id="customerEmail" type="email" required className="rounded-none border-border font-mono text-sm h-10" value={formData.customerEmail} onChange={e => setFormData(p => ({...p, customerEmail: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerCompany" className="font-mono text-xs font-bold uppercase text-muted-foreground">Компания (ИНН/Название)</Label>
                <Input id="customerCompany" className="rounded-none border-border font-mono text-sm h-10" value={formData.customerCompany} onChange={e => setFormData(p => ({...p, customerCompany: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress" className="font-mono text-xs font-bold uppercase text-muted-foreground">Адрес доставки</Label>
                <Textarea id="deliveryAddress" className="rounded-none border-border font-mono text-sm min-h-[80px]" value={formData.deliveryAddress} onChange={e => setFormData(p => ({...p, deliveryAddress: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment" className="font-mono text-xs font-bold uppercase text-muted-foreground">Комментарий</Label>
                <Textarea id="comment" className="rounded-none border-border font-mono text-sm min-h-[80px]" value={formData.comment} onChange={e => setFormData(p => ({...p, comment: e.target.value}))} />
              </div>

              <div className="mt-4 pt-6 border-t border-border flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <span className="font-mono text-sm text-muted-foreground">Итого к оплате</span>
                  <span className="font-mono font-bold text-2xl">{totalPrice.toLocaleString("ru-RU")} ₽</span>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    id="consent"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(!!v)}
                    className="mt-0.5 rounded-none border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent shrink-0"
                  />
                  <span className="font-mono text-[11px] text-muted-foreground leading-[1.5] group-hover:text-foreground transition-colors">
                    Я ознакомлен(а) и согласен(на) с условиями{" "}
                    <a href="/docs/public-offer.pdf" target="_blank" rel="noopener noreferrer"
                      className="text-accent underline hover:no-underline"
                      onClick={e => e.stopPropagation()}>
                      публичной оферты
                    </a>{" "}
                    и{" "}
                    <a href="/docs/privacy-policy.pdf" target="_blank" rel="noopener noreferrer"
                      className="text-accent underline hover:no-underline"
                      onClick={e => e.stopPropagation()}>
                      Политикой обработки персональных данных
                    </a>
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={createOrder.isPending || !agreed}
                  className="w-full rounded-none font-bold uppercase tracking-wider h-12 bg-accent hover:bg-accent/90 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {createOrder.isPending ? "Оформление..." : "Подтвердить заказ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
