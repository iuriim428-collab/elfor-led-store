import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, AlertCircle, CheckCircle2, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface DocInfo {
  objectPath: string | null;
  filename: string | null;
  updatedAt: string | null;
}

interface DocumentsData {
  privacy: DocInfo;
  offer: DocInfo;
}

async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Не удалось получить URL для загрузки");
  return res.json();
}

async function uploadToGcs(uploadURL: string, file: File): Promise<void> {
  const res = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Ошибка загрузки файла");
}

interface DocUploadCardProps {
  type: "privacy" | "offer";
  label: string;
  description: string;
  info: DocInfo | undefined;
  password: string | null;
  onSuccess: () => void;
}

function DocUploadCard({ type, label, description, info, password, onSuccess }: DocUploadCardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Ошибка", description: "Только PDF файлы", variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress("Получение URL...");

    try {
      const { uploadURL, objectPath } = await requestUploadUrl(file);
      setProgress("Загрузка файла...");
      await uploadToGcs(uploadURL, file);
      setProgress("Сохранение...");

      const res = await fetch(`/api/documents/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password ?? "" },
        body: JSON.stringify({ objectPath, filename: file.name }),
      });

      if (!res.ok) throw new Error("Не удалось сохранить документ");

      onSuccess();
      toast({ title: `${label} загружен`, description: file.name });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!confirm(`Удалить «${label}» с сайта?`)) return;
    await fetch(`/api/documents/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password ?? "" },
      body: JSON.stringify({ objectPath: "", filename: "" }),
    });
    onSuccess();
    toast({ title: "Документ удалён" });
  }

  return (
    <div className="border border-border p-6 space-y-4">
      <div>
        <h3 className="font-serif font-bold text-base uppercase tracking-wide">{label}</h3>
        <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
      </div>

      {info?.objectPath ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm font-semibold truncate">{info.filename ?? "document.pdf"}</div>
              {info.updatedAt && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  Обновлён: {format(new Date(info.updatedAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={`/api/storage${info.objectPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Просмотреть
            </a>
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-xs text-destructive border-destructive/30 hover:bg-destructive/5 h-auto py-1.5">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Удалить
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-yellow-600" />
          <span className="text-sm">Документ не загружен — ссылка в футере не работает</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFile}
        className="hidden"
        disabled={uploading}
      />

      {uploading ? (
        <div className="flex items-center gap-3 py-2">
          <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full" />
          <span className="text-sm text-muted-foreground">{progress}</span>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-colors"
        >
          <Upload className="h-4 w-4" />
          {info?.objectPath ? "Заменить PDF" : "Загрузить PDF"}
        </button>
      )}
    </div>
  );
}

export default function AdminDocuments() {
  const { password } = useAdminAuth();
  const queryClient = useQueryClient();

  const { data: docs } = useQuery<DocumentsData>({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await fetch("/api/documents");
      return res.json();
    },
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-serif font-bold uppercase tracking-wide mb-1">Юридические документы</h2>
        <p className="text-muted-foreground text-sm">
          Загрузите PDF — ссылки в футере сайта станут рабочими.
        </p>
      </div>

      <DocUploadCard
        type="privacy"
        label="Политика конфиденциальности"
        description="Ссылка «Политика конфиденциальности» в нижней части сайта"
        info={docs?.privacy}
        password={password}
        onSuccess={refresh}
      />

      <DocUploadCard
        type="offer"
        label="Договор оферты"
        description="Ссылка «Договор оферты» в нижней части сайта"
        info={docs?.offer}
        password={password}
        onSuccess={refresh}
      />
    </div>
  );
}
