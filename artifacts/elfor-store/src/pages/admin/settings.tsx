import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Mail } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        setNotifyEmail(data.notify_email ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notify_email: notifyEmail }),
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
    <div className="max-w-xl flex flex-col gap-8">
      <form onSubmit={handleSave} className="border border-border bg-card p-6 flex flex-col gap-6">
        <div className="border-b border-border pb-4 flex items-center gap-3">
          <Mail className="h-5 w-5 text-accent" />
          <h2 className="font-serif font-bold uppercase text-base">Уведомления о заказах</h2>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="notify_email" className="font-mono text-xs font-bold uppercase text-muted-foreground">
            Email для уведомлений о новых заказах
          </Label>
          <Input
            id="notify_email"
            type="email"
            value={notifyEmail}
            onChange={e => setNotifyEmail(e.target.value)}
            placeholder="admin@example.com"
            className="rounded-none border-border font-mono text-sm h-10"
          />
          <p className="font-mono text-[11px] text-muted-foreground">
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
    </div>
  );
}
