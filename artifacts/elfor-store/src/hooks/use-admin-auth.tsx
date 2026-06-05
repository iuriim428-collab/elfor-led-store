import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const STORAGE_KEY = "elfor_admin_auth";
const SESSION_HOURS = 12;

interface AdminAuthContextType {
  isAdmin: boolean;
  password: string | null;
  login: (password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

function readStorage(): { isAdmin: boolean; password: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isAdmin: false, password: null };
    const { expiresAt, password } = JSON.parse(raw);
    if (Date.now() < expiresAt) return { isAdmin: true, password: password ?? null };
    return { isAdmin: false, password: null };
  } catch {
    return { isAdmin: false, password: null };
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => readStorage());

  const login = useCallback(async (pw: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.ok) {
        const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiresAt, password: pw }));
        setState({ isAdmin: true, password: pw });
      }
      return data;
    } catch {
      return { ok: false, message: "Ошибка соединения" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ isAdmin: false, password: null });
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin: state.isAdmin, password: state.password, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
