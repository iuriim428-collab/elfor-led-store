import { useLocation, useParams } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { resolveStorageUrl } from "@/lib/utils";

interface Project {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  published: z.boolean().default(true),
});

async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });

  if (!res.ok) {
    throw new Error("Не удалось получить адрес для загрузки изображения");
  }

  return res.json();
}

async function uploadImage(file: File): Promise<string> {
  const { uploadURL, objectPath } = await requestUploadUrl(file);
  const uploadRes = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Не удалось загрузить изображение");
  }

  return objectPath;
}

export default function AdminProjectForm() {
  const { id } = useParams();
  const isEditing = Boolean(id && id !== "new");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const projectId = Number(id);
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        throw new Error("Не удалось загрузить проект");
      }

      return res.json();
    },
    enabled: isEditing && Number.isFinite(projectId),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      published: true,
    },
  });

  const initRef = useRef(false);

  useEffect(() => {
    if (!project || initRef.current) {
      return;
    }

    form.reset({
      title: project.title,
      description: project.description ?? "",
      imageUrl: project.imageUrl ?? "",
      published: project.published,
    });
    initRef.current = true;
  }, [form, project]);

  const saveProject = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        imageUrl: values.imageUrl || undefined,
        published: values.published,
      };

      const res = await fetch(isEditing ? `/api/projects/${projectId}` : "/api/projects", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(isEditing ? "Не удалось обновить проект" : "Не удалось создать проект");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: isEditing ? "Проект обновлён" : "Проект создан" });
      setLocation("/projects");
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сохранить проект",
        variant: "destructive",
      });
    },
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({ title: "Ошибка", description: "Можно загружать только изображения", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      const objectPath = await uploadImage(file);
      form.setValue("imageUrl", objectPath, { shouldDirty: true, shouldValidate: true });
      toast({ title: "Изображение загружено" });
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: error instanceof Error ? error.message : "Не удалось загрузить изображение",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isEditing && isLoading) {
    return <div className="font-mono">Загрузка...</div>;
  }

  const currentImage = form.watch("imageUrl");

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="font-serif font-bold text-lg uppercase">
          {isEditing ? "Редактирование проекта" : "Новый проект"}
        </h2>
        <Button variant="outline" onClick={() => setLocation("/projects")} className="rounded-none border-border font-mono text-xs">
          Отмена
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => saveProject.mutate(values))} className="space-y-8 font-mono">
          <div className="grid grid-cols-1 gap-6 p-6 border border-border bg-card">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase">Название проекта</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-none border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase">Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      className="rounded-none border-border min-h-[180px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase">Фото проекта</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Загрузите фотографию проекта или вставьте путь вручную.
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-none border-border"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Загрузить фото
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase">Путь к изображению</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} className="rounded-none border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {currentImage ? (
                <div className="relative border border-border bg-muted overflow-hidden max-w-md">
                  <img
                    src={resolveStorageUrl(currentImage)}
                    alt=""
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => form.setValue("imageUrl", "", { shouldDirty: true, shouldValidate: true })}
                    className="absolute top-2 right-2 h-8 w-8 bg-black/70 text-white flex items-center justify-center hover:bg-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-border p-8 text-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto mb-3" />
                  Фотография пока не добавлена
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-none border border-border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="rounded-none border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-xs font-bold uppercase">Опубликовано</FormLabel>
                    <p className="text-[10px] text-muted-foreground">Проект будет виден посетителям сайта</p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={saveProject.isPending || isUploading}
            className="w-full rounded-none bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider h-12"
          >
            {saveProject.isPending ? "Сохранение..." : isEditing ? "Сохранить изменения" : "Создать проект"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
