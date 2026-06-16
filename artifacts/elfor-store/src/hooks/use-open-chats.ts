import { useState, useEffect } from "react";

export function useOpenChats() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch("/api/chat/sessions");
        if (!r.ok) return;
        const sessions: Array<{ status: string }> = await r.json();
        setCount(sessions.filter(s => s.status === "open").length);
      } catch {}
    };

    poll();
    const id = setInterval(poll, 8000);
    return () => clearInterval(id);
  }, []);

  return count;
}
