import { useQuery } from "@tanstack/react-query";

export interface SiteSettings {
  notify_email?: string;
  phone?: string;
  email?: string;
  address?: string;
  work_hours?: string;
  company_name?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
}

export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
