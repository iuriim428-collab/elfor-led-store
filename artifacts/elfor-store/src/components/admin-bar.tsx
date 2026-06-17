import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LayoutDashboard, LogOut, Lock, Loader2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminBar() {
  const { isAdmin, login, logout } = useAdminAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(password);
    setLoading(false);
    if (result.ok) {
      setOpen(false);
      setPassword("");
      toast({ title: "Вы вошли как администратор" });
    } else {
      toast({ title: "Ошибка", description: result.message ?? "Неверный пароль", variant: "destructive" });
    }
  };

  if (!isAdmin) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-none border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif uppercase tracking-wider flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              Вход для администратора
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-2">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-none border-border font-mono h-10"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-none font-bold uppercase tracking-wider h-10 bg-accent hover:bg-accent/90 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
              Войти
            </Button>
          </form>
        </DialogContent>

        {/* Trigger — hidden at bottom, only visible on hover */}
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-6 z-50 opacity-20 hover:opacity-100 focus:opacity-100 transition-all duration-300 bg-primary text-primary-foreground px-3 py-2 text-[10px] font-mono uppercase tracking-widest border border-primary-foreground/20 hover:border-accent flex items-center gap-1.5 shadow-lg"
          title="Вход для администратора"
        >
          <Lock className="h-3 w-3" />
          Администратор
        </button>
      </Dialog>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-primary border-b border-primary-foreground/10 h-9 flex items-center px-4 gap-3 shadow-lg">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent mr-2">
        ADMIN MODE
      </span>

      <div className="flex-1 flex items-center gap-2">
        <a
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-1 bg-accent text-white text-[11px] font-mono font-bold uppercase tracking-wide hover:bg-accent/80 transition-colors"
        >
          <LayoutDashboard className="h-3 w-3" />
          Открыть админку
        </a>
      </div>

      <div className="flex items-center gap-1 text-[10px] font-mono text-primary-foreground/50">
        <ShoppingBag className="h-3 w-3" />
        <span>Просмотр магазина</span>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono uppercase tracking-wide text-primary-foreground/60 hover:text-white hover:bg-primary-foreground/10 transition-colors"
      >
        <LogOut className="h-3 w-3" />
        Выйти
      </button>
    </div>
  );
}

export function useAdminLoginTrigger() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
