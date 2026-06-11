import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Mail, Phone, MapPin, Building2 } from "lucide-react";

interface Fields {
  notify_email: string;
  phone: string;
  email: string;
  address: string;
  work_hours: string;
  company_name: string;
  inn: string;
  kpp: string;
  ogrn: string;
}

const DEFAULTS: Fields = {
  notify_email: "",
  phone: "",
  email: "",
  address: "",
  work_hours: "",
  company_name: "",
  inn: "",
  kpp: "",
  ogrn: "",
};

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<Fields>(DEFAULTS);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        setFields({
          notify_email: data.notify_email ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          address: data.address ?? "",
          work_hours: data.work_hours ?? "",
          company_name: data.company_name ?? "",
          inn: data.inn ?? "",
          kpp: data.kpp ?? "",
          ogrn: data.ogrn ?? "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Настройки сохранены" });
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="font-mono text-sm text-muted-foreground">Загрузка...</div>;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">

      {/* Contacts */}
      <div className="border border-border bg-card p-6 flex flex-col gap-5">
        <div className="border-b border-border pb-4 flex items-center gap-3">
          <Phone className="h-5 w-5 text-accent" />
          <h2 className="font-serif font-bold uppercase text-base">Контакты</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Телефон" id="phone" value={fields.phone} onChange={set("phone")} placeholder="8 (800) 000-00-00" />
          <Field label="Email" id="email" value={fields.email} onChange={set("email")} placeholder="info@lfour.ru" />
        </div>

        <Field
          label="Адрес"
          id="address"
          value={fields.address}
          onChange={set("address")}
          placeholder="Россия, г. Москва, ул. Производственная, д. 1"
        />

        <Field
          label="Режим работы"
          id="work_hours"
          value={fields.work_hours}
          onChange={set("work_hours")}
          placeholder="Пн-Пт 9:00–18:00"
        />
      </div>

      {/* Requisites */}
      <div className="border border-border bg-card p-6 flex flex-col gap-5">
        <div className="border-b border-border pb-4 flex items-center gap-3">
          <Building2 className="h-5 w-5 text-accent" />
          <h2 className="font-serif font-bold uppercase text-base">Реквизиты</h2>
        </div>

        <Field label='Полное наименование (ООО "...")' id="company_name" value={fields.company_name} onChange={set("company_name")} placeholder='ООО "ЭЛФОР"' />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="ИНН" id="inn" value={fields.inn} onChange={set("inn")} placeholder="1234567890" />
          <Field label="КПП" id="kpp" value={fields.kpp} onChange={set("kpp")} placeholder="123456789" />
          <Field label="ОГРН" id="ogrn" value={fields.ogrn} onChange={set("ogrn")} placeholder="1234567890123" />
        </div>
      </div>

      {/* Notifications */}
      <div className="border border-border bg-card p-6 flex flex-col gap-5">
        <div className="border-b border-border pb-4 flex items-center gap-3">
          <Mail className="h-5 w-5 text-accent" />
          <h2 className="font-serif font-bold uppercase text-base">Уведомления о заказах</h2>
        </div>

        <Field
          label="Email для уведомлений о новых заказах"
          id="notify_email"
          type="email"
          value={fields.notify_email}
          onChange={set("notify_email")}
          placeholder="admin@example.com"
        />
        <p className="font-mono text-[11px] text-muted-foreground -mt-3">
          На этот адрес будут отправляться письма при каждом новом заказе.
        </p>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="self-start rounded-none font-bold uppercase tracking-wider h-10 px-6 bg-accent hover:bg-accent/90 text-white"
      >
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Сохранение..." : "Сохранить"}
      </Button>
    </form>
  );
}

function Field({
  label, id, value, onChange, placeholder, type = "text",
}: {
  label: string; id: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="font-mono text-xs font-bold uppercase text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-none border-border font-mono text-sm h-10"
      />
    </div>
  );
}
