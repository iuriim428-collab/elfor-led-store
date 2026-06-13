import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, CheckCircle, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: number;
  token: string;
  visitorName: string | null;
  visitorPhone: string | null;
  visitorEmail: string | null;
  status: string;
  createdAt: string;
  lastMessageAt: string;
}

interface Message {
  id: number;
  sessionId: number;
  sender: "visitor" | "admin";
  text: string;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}с назад`;
  if (diff < 3600) return `${Math.floor(diff / 60)}м назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ч назад`;
  return new Date(iso).toLocaleDateString("ru-RU");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminChat() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = useCallback(async () => {
    const r = await fetch("/api/chat/sessions");
    if (r.ok) setSessions(await r.json());
  }, []);

  const fetchMessages = useCallback(async (id: number) => {
    const r = await fetch(`/api/chat/sessions/${id}/messages`);
    if (r.ok) {
      const msgs: Message[] = await r.json();
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    pollRef.current = setInterval(() => {
      fetchSessions();
      if (activeId) fetchMessages(activeId);
    }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchSessions, fetchMessages, activeId]);

  const selectSession = (id: number) => {
    setActiveId(id);
    fetchMessages(id);
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeId || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply("");
    try {
      const r = await fetch(`/api/chat/sessions/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (r.ok) await fetchMessages(activeId);
      else toast({ title: "Ошибка отправки", variant: "destructive" });
    } catch {
      toast({ title: "Ошибка отправки", variant: "destructive" });
    }
    setSending(false);
  };

  const closeSession = async (id: number) => {
    await fetch(`/api/chat/sessions/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" }),
    });
    await fetchSessions();
    toast({ title: "Чат закрыт" });
  };

  const reopenSession = async (id: number) => {
    await fetch(`/api/chat/sessions/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "open" }),
    });
    await fetchSessions();
  };

  const activeSession = sessions.find(s => s.id === activeId);
  const openSessions = sessions.filter(s => s.status === "open");
  const closedSessions = sessions.filter(s => s.status === "closed");

  return (
    <div className="flex gap-0 border border-border bg-card overflow-hidden" style={{ height: "calc(100vh - 140px)", minHeight: 500 }}>
      {/* Session list */}
      <div className="w-72 border-r border-border flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-accent" />
            <span className="font-serif font-bold uppercase text-sm">Диалоги</span>
            {openSessions.length > 0 && (
              <span className="ml-auto bg-accent text-white text-[10px] font-bold px-2 py-0.5">{openSessions.length}</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 && (
            <p className="text-xs text-muted-foreground font-mono p-4 text-center">Нет обращений</p>
          )}
          {openSessions.length > 0 && (
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase text-muted-foreground">Открытые</div>
          )}
          {openSessions.map(s => (
            <SessionItem key={s.id} session={s} active={activeId === s.id} onClick={() => selectSession(s.id)} />
          ))}
          {closedSessions.length > 0 && (
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase text-muted-foreground border-t border-border mt-1">Закрытые</div>
          )}
          {closedSessions.map(s => (
            <SessionItem key={s.id} session={s} active={activeId === s.id} onClick={() => selectSession(s.id)} />
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground font-mono text-sm gap-2">
            <MessageCircle className="h-10 w-10 opacity-20" />
            <p>Выберите диалог</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-sm shrink-0">
                  {(activeSession.visitorName?.[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <div className="font-serif font-bold text-sm">{activeSession.visitorName ?? "Аноним"}</div>
                  <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                    {activeSession.visitorPhone && <span>{activeSession.visitorPhone}</span>}
                    <span className={cn(
                      "px-1.5 py-0.5 text-[10px] font-bold border",
                      activeSession.status === "open"
                        ? "bg-green-500/10 text-green-700 border-green-500/20"
                        : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                    )}>
                      {activeSession.status === "open" ? "Открыт" : "Закрыт"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {activeSession.status === "open" ? (
                  <Button size="sm" variant="outline" onClick={() => closeSession(activeSession.id)}
                    className="rounded-none border-border font-mono text-xs h-8 gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Закрыть
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => reopenSession(activeSession.id)}
                    className="rounded-none border-border font-mono text-xs h-8 gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Открыть
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {messages.length === 0 && (
                <p className="text-xs text-center text-muted-foreground font-mono mt-4">Сообщений пока нет</p>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex flex-col gap-0.5 max-w-[75%]", msg.sender === "admin" ? "self-end items-end" : "self-start items-start")}>
                  <div className="text-[10px] font-mono text-muted-foreground px-1">
                    {msg.sender === "admin" ? "Менеджер" : (activeSession.visitorName ?? "Клиент")}
                  </div>
                  <div className={cn(
                    "px-4 py-2.5 text-sm font-mono leading-relaxed",
                    msg.sender === "admin"
                      ? "bg-accent text-white"
                      : "bg-muted text-primary border border-border"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply input */}
            {activeSession.status === "open" ? (
              <form onSubmit={sendReply} className="border-t border-border p-4 flex gap-3 shrink-0">
                <Input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Введите ответ..."
                  className="rounded-none border-border font-mono text-sm flex-1 focus-visible:ring-0"
                  disabled={sending}
                />
                <Button type="submit" disabled={!reply.trim() || sending}
                  className="rounded-none bg-accent hover:bg-accent/90 text-white font-bold h-10 px-5 gap-2">
                  <Send className="h-4 w-4" /> Отправить
                </Button>
              </form>
            ) : (
              <div className="border-t border-border p-4 text-center font-mono text-sm text-muted-foreground">
                Чат закрыт
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SessionItem({ session, active, onClick }: { session: Session; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-border/50 flex items-center gap-3 transition-colors hover:bg-muted/50",
        active ? "bg-accent/10 border-l-2 border-l-accent" : ""
      )}
    >
      <div className={cn(
        "w-8 h-8 flex items-center justify-center font-serif font-bold text-xs shrink-0",
        session.status === "open" ? "bg-accent text-white" : "bg-muted text-muted-foreground"
      )}>
        {(session.visitorName?.[0] ?? "?").toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-sm font-bold truncate">{session.visitorName ?? "Аноним"}</div>
        <div className="text-[10px] font-mono text-muted-foreground">{timeAgo(session.lastMessageAt)}</div>
      </div>
      {session.status === "open" && <div className="w-2 h-2 rounded-full bg-accent shrink-0" />}
    </button>
  );
}
