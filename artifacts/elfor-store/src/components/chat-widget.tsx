import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  sender: "visitor" | "admin";
  text: string;
  createdAt: string;
}

interface Session {
  id: number;
  token: string;
  status: string;
}

interface ChatOpenRequest {
  id: number;
  message?: string;
}

const TOKEN_KEY = "elfor_chat_token";

function formatPhone(raw: string): string {
  // Strip everything except digits
  let digits = raw.replace(/\D/g, "");

  // Normalize leading digit
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  else if (digits.startsWith("9")) digits = "7" + digits;
  else if (digits.startsWith("7")) { /* ok */ }
  else if (digits.length > 0) digits = "7" + digits;

  // Keep only 11 digits max (7 + 10)
  digits = digits.slice(0, 11);

  // Remove leading 7 for formatting the rest
  const local = digits.slice(1); // up to 10 digits after 7

  let result = "+7";
  if (local.length === 0) return result;
  if (local.length <= 3) return `${result} (${local}`;
  result += ` (${local.slice(0, 3)})`;
  if (local.length <= 6) return `${result} ${local.slice(3)}`;
  result += ` ${local.slice(3, 6)}`;
  if (local.length <= 8) return `${result}-${local.slice(6)}`;
  result += `-${local.slice(6, 8)}`;
  if (local.length <= 10) return `${result}-${local.slice(8)}`;
  return result;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function ChatWidget({ openRequest }: { openRequest?: ChatOpenRequest | null }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const pendingMessageRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Listen for external open trigger (e.g. callback button)
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<{ message?: string }>).detail?.message;
      if (msg) pendingMessageRef.current = msg;
      setOpen(true);
    };
    window.addEventListener("elfor:open-chat", handler);
    return () => window.removeEventListener("elfor:open-chat", handler);
  }, []);

  useEffect(() => {
    if (!openRequest?.id) return;
    if (openRequest.message) pendingMessageRef.current = openRequest.message;
    setOpen(true);
  }, [openRequest]);

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch(`/api/chat/sessions/by-token/${token}`)
        .then(r => r.ok ? r.json() : null)
        .then((s: Session | null) => {
          if (s) { setSession(s); setStep("chat"); }
        })
        .catch(() => {});
    }
  }, []);

  const playNotification = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Two-tone soft chime: high then slightly lower
      const tones = [880, 660];
      tones.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (token: string) => {
    try {
      const r = await fetch(`/api/chat/sessions/by-token/${token}/messages`);
      if (!r.ok) return;
      const msgs: Message[] = await r.json();
      setMessages(prev => {
        // Don't count unread on initial load (prev is empty) — only on new incoming messages
        if (prev.length === 0) return msgs;
        const newAdminMsgs = msgs.filter(
          m => m.sender === "admin" && !prev.some(p => p.id === m.id)
        ).length;
        if (!open && newAdminMsgs > 0) {
          setUnread(u => u + newAdminMsgs);
          playNotification();
        }
        return msgs;
      });
    } catch {}
  }, [open, playNotification]);

  // Start polling when session exists
  useEffect(() => {
    if (!session) return;
    fetchMessages(session.token);
    pollRef.current = setInterval(() => fetchMessages(session.token), 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [session, fetchMessages]);

  // Scroll to bottom
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Clear unread on open
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const r = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorName: name.trim(), visitorPhone: phone.trim() }),
      });
      const s: Session = await r.json();
      localStorage.setItem(TOKEN_KEY, s.token);
      setSession(s);
      setStep("chat");
      // Send greeting message automatically
      const greeting = pendingMessageRef.current
        ? `Здравствуйте! Меня зовут ${name.trim()}. Прошу перезвонить мне.`
        : `Здравствуйте! Меня зовут ${name.trim()}. Хочу задать вопрос.`;
      pendingMessageRef.current = null;
      await fetch(`/api/chat/sessions/by-token/${s.token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: greeting }),
      });
      await fetchMessages(s.token);
    } catch {}
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session || sending) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      await fetch(`/api/chat/sessions/by-token/${session.token}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      await fetchMessages(session.token);
    } catch {}
    setSending(false);
  };

  const resetChat = () => {
    localStorage.removeItem(TOKEN_KEY);
    setSession(null);
    setMessages([]);
    setStep("form");
    setName("");
    setPhone("");
    if (pollRef.current) clearInterval(pollRef.current);
  };

  return (
    <div className="fixed bottom-[72px] right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-80 sm:w-96 border border-border bg-background shadow-2xl flex flex-col overflow-hidden"
             style={{ height: 480 }}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="font-serif font-bold text-sm uppercase tracking-wider">Онлайн чат ЭЛФОР</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/60 hover:text-white transition-colors">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {step === "form" ? (
            /* Intro form */
            <form onSubmit={startChat} className="flex-1 flex flex-col justify-center gap-4 p-6 font-mono">
              <p className="text-sm text-muted-foreground">Представьтесь — наш менеджер ответит вам в ближайшее время.</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-muted-foreground">Ваше имя *</label>
                <Input
                  value={name} onChange={e => setName(e.target.value)} required
                  placeholder="Иван Иванов"
                  className="rounded-none border-border h-10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-muted-foreground">Телефон</label>
                <Input
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 (___) ___-__-__"
                  inputMode="tel"
                  className="rounded-none border-border h-10 text-sm"
                />
              </div>
              <Button type="submit" className="rounded-none bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider h-10 text-sm">
                Начать чат
              </Button>
            </form>
          ) : (
            /* Chat messages */
            <>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground font-mono mt-4">
                    Чат открыт. Задайте ваш вопрос — мы ответим в ближайшее время.
                  </p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={cn("flex flex-col gap-0.5 max-w-[85%]", msg.sender === "visitor" ? "self-end items-end" : "self-start items-start")}>
                    <div className={cn(
                      "px-3 py-2 text-sm font-mono leading-relaxed",
                      msg.sender === "visitor"
                        ? "bg-accent text-white"
                        : "bg-muted text-primary border border-border"
                    )}>
                      {msg.sender === "admin" && <span className="block text-[10px] font-bold uppercase text-accent mb-0.5">Менеджер ЭЛФОР</span>}
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {session?.status === "closed" ? (
                <div className="p-3 border-t border-border bg-muted text-center font-mono text-xs text-muted-foreground">
                  Чат закрыт.{" "}
                  <button onClick={resetChat} className="text-accent underline hover:no-underline">Начать новый</button>
                </div>
              ) : (
                <form onSubmit={sendMessage} className="border-t border-border p-3 flex gap-2 shrink-0">
                  <Input
                    value={input} onChange={e => setInput(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="rounded-none border-border h-10 text-sm font-mono flex-1 focus-visible:ring-0"
                    disabled={sending}
                  />
                  <Button type="submit" disabled={!input.trim() || sending}
                    className="rounded-none bg-accent hover:bg-accent/90 text-white h-10 w-10 p-0 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* Bubble button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-11 h-11 bg-accent hover:bg-accent/90 text-white shadow-lg flex items-center justify-center transition-all relative"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
