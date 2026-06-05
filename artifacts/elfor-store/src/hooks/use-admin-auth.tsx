import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const STORAGE_KEY = "elfor_admin_auth";
const SESSION_HOURS = 12;

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

function readStorage(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { expiresAt } = JSON.parse(raw);
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => readStorage());

  const login = useCallback(async (password: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiresAt }));
        setIsAdmin(true);
      }
      return data;
    } catch {
      return { ok: false, message: "Ошибка соединения" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
