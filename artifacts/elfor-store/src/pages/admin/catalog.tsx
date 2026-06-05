import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Trash2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface CatalogInfo {
  objectPath: string | null;
  filename: string | null;
  updatedAt: string | null;
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
  if (!res.ok) throw new Error("Ошибка загрузки файла в хранилище");
}

export default function AdminCatalog() {
  const { password } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const { data: catalog, isLoading } = useQuery<CatalogInfo>({
    queryKey: ["catalog"],
    queryFn: async () => {
      const res = await fetch("/api/catalog");
      return res.json();
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Ошибка", description: "Можно загружать только PDF файлы", variant: "destructive" });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "Ошибка", description: "Файл слишком большой (максимум 100 МБ)", variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress("Получение URL для загрузки...");

    try {
      const { uploadURL, objectPath } = await requestUploadUrl(file);

      setProgress("Загрузка файла в хранилище...");
      await uploadToGcs(uploadURL, file);

      setProgress("Сохранение информации о каталоге...");
      const saveRes = await fetch("/api/catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password ?? "",
        },
        body: JSON.stringify({ objectPath, filename: file.name }),
      });

      if (!saveRes.ok) throw new Error("Не удалось сохранить каталог");

      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast({ title: "Каталог загружен", description: `${file.name} успешно опубликован` });
    } catch (err) {
      toast({
        title: "Ошибка загрузки",
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
    if (!confirm("Удалить текущий каталог с сайта?")) return;
    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password ?? "" },
      body: JSON.stringify({ objectPath: "", filename: "" }),
    });
    if (res.ok) {
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast({ title: "Каталог удалён", description: "Кнопка скачивания скрыта на сайте" });
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-serif font-bold uppercase tracking-wide mb-1">Каталог продукции</h2>
        <p className="text-muted-foreground text-sm">
          Загрузите PDF-каталог — он появится на сайте как кнопка для скачивания.
        </p>
      </div>

      {/* Current catalog status */}
      <div className="border border-border p-6 space-y-4">
        <h3 className="font-semibold uppercase tracking-wider text-sm">Текущий каталог</h3>

        {isLoading ? (
          <div className="text-muted-foreground text-sm animate-pulse">Загрузка...</div>
        ) : catalog?.objectPath ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-semibold truncate">{catalog.filename ?? "catalog.pdf"}</div>
                {catalog.updatedAt && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Обновлён: {format(new Date(catalog.updatedAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`/api/storage${catalog.objectPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-semibold hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Скачать для проверки
              </a>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive border-destructive/30 hover:bg-destructive/5">
                <Trash2 className="h-4 w-4 mr-1.5" />
                Удалить
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">Каталог ещё не загружен. Кнопка скачивания скрыта на сайте.</span>
          </div>
        )}
      </div>

      {/* Upload section */}
      <div className="border border-border p-6 space-y-4">
        <h3 className="font-semibold uppercase tracking-wider text-sm">
          {catalog?.objectPath ? "Заменить каталог" : "Загрузить каталог"}
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full" />
              <span className="text-sm text-muted-foreground">{progress}</span>
            </div>
            <div className="h-1.5 bg-muted overflow-hidden">
              <div className="h-full bg-accent animate-pulse w-2/3" />
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border hover:border-accent transition-colors p-10 flex flex-col items-center gap-3 cursor-pointer group"
          >
            <div className="h-14 w-14 bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <FileText className="h-7 w-7 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">Нажмите для выбора PDF</div>
              <div className="text-xs text-muted-foreground mt-1">Максимальный размер: 100 МБ</div>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold group-hover:bg-accent transition-colors">
              <Upload className="h-4 w-4" />
              Выбрать файл
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
