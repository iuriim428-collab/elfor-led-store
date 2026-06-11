import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

export default function Contacts() {
  const { toast } = useToast();
  const { data: s = {} } = useSettings();

  const phone = s.phone || "8 (800) 000-00-00";
  const phoneHref = "tel:+" + phone.replace(/\D/g, "");
  const email = s.email || "info@lfour.ru";
  const address = s.address || "Россия, г. Москва, ул. Производственная, д. 1, стр. 1";
  const workHours = s.work_hours || "Пн-Пт с 9:00 до 18:00";
  const companyName = s.company_name || 'ООО "ЭЛФОР"';
  const inn = s.inn || "1234567890";
  const kpp = s.kpp || "123456789";
  const ogrn = s.ogrn || "1234567890123";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Сообщение отправлено",
      description: "Мы свяжемся с вами в ближайшее время.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span>/</span>
        <span className="text-primary">Контакты</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-serif font-black uppercase mb-12">Контакты</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-8">
          <div className="border border-border bg-card p-8">
            <h2 className="font-serif font-bold uppercase text-lg mb-6">Свяжитесь с нами</h2>
            <ul className="space-y-6 font-mono text-sm">
              <li className="flex gap-4">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <a href={phoneHref} className="font-bold text-lg hover:text-accent block">{phone}</a>
                  <span className="text-muted-foreground text-xs">Бесплатно по всей России</span>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <a href={`mailto:${email}`} className="font-bold hover:text-accent block">{email}</a>
                  <span className="text-muted-foreground text-xs">Общие вопросы и заказы</span>
                </div>
              </li>
              <li className="flex gap-4">
                <MapPin className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <span className="font-bold block mb-1">Центральный офис и производство</span>
                  <span className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {address}{"\n"}{workHours}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="border border-border bg-card p-8">
            <h2 className="font-serif font-bold uppercase text-lg mb-4">Реквизиты</h2>
            <div className="font-mono text-sm text-muted-foreground flex flex-col gap-2">
              <div className="flex justify-between border-b border-border border-dashed pb-1">
                <span>Организация</span>
                <span className="font-bold text-primary">{companyName}</span>
              </div>
              <div className="flex justify-between border-b border-border border-dashed pb-1">
                <span>ИНН</span>
                <span className="font-bold text-primary">{inn}</span>
              </div>
              <div className="flex justify-between border-b border-border border-dashed pb-1">
                <span>КПП</span>
                <span className="font-bold text-primary">{kpp}</span>
              </div>
              <div className="flex justify-between border-b border-border border-dashed pb-1">
                <span>ОГРН</span>
                <span className="font-bold text-primary">{ogrn}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border bg-card p-8">
          <h2 className="font-serif font-bold uppercase text-lg mb-6">Написать нам</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase">Ваше имя</Label>
              <Input id="name" required className="rounded-none border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase">Email</Label>
              <Input id="email" type="email" required className="rounded-none border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase">Телефон</Label>
              <Input id="phone" type="tel" className="rounded-none border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs font-bold uppercase">Сообщение</Label>
              <Textarea id="message" required className="rounded-none border-border min-h-[120px]" />
            </div>
            <Button type="submit" className="mt-4 rounded-none bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider h-12">
              Отправить
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
