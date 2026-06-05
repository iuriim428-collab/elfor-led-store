import { useCreateArticle, useUpdateArticle, useGetArticle } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  slug: z.string().min(1, "Slug обязателен"),
  type: z.enum(["news", "article"]),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  published: z.boolean().default(false),
});

export default function AdminArticleForm() {
  const { id } = useParams();
  const isEditing = !!id && id !== "new";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useGetArticle(parseInt(id!), { 
    query: { enabled: isEditing } 
  });

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      type: "news",
      published: false,
    }
  });

  const initRef = useRef(false);

  useEffect(() => {
    if (isEditing && article && !initRef.current) {
      form.reset({
        title: article.title,
        slug: article.slug,
        type: article.type,
        excerpt: article.excerpt ?? undefined,
        content: article.content ?? undefined,
        imageUrl: article.imageUrl ?? undefined,
        published: article.published,
      });
      initRef.current = true;
    }
  }, [article, isEditing, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      excerpt: values.excerpt || undefined,
      content: values.content || undefined,
      imageUrl: values.imageUrl || undefined,
    };

    if (isEditing) {
      updateArticle.mutate({ id: parseInt(id!), data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
          toast({ title: "Сохранено" });
          setLocation("/admin/articles");
        }
      });
    } else {
      createArticle.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
          toast({ title: "Создано" });
          setLocation("/admin/articles");
        }
      });
    }
  };

  if (isEditing && isLoading) return <div>Загрузка...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="font-serif font-bold text-lg uppercase">{isEditing ? "Редактирование статьи" : "Новая статья"}</h2>
        <Button variant="outline" onClick={() => setLocation("/admin/articles")} className="rounded-none border-border font-mono text-xs">
          Отмена
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border bg-card">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-xs font-bold uppercase">Заголовок</FormLabel>
                <FormControl><Input {...field} className="rounded-none border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Slug (URL)</FormLabel>
                <FormControl><Input {...field} className="rounded-none border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Тип</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-none border-border">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-none border-border font-mono">
                    <SelectItem value="news">Новость</SelectItem>
                    <SelectItem value="article">Статья</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-xs font-bold uppercase">URL картинки</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} className="rounded-none border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="published" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-none border border-border p-4 md:col-span-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="rounded-none border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-xs font-bold uppercase">Опубликовано</FormLabel>
                  <p className="text-[10px] text-muted-foreground">Видно посетителям сайта</p>
                </div>
              </FormItem>
            )} />
          </div>

          <div className="p-6 border border-border bg-card space-y-6">
            <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-2">Контент</h3>
            
            <FormField control={form.control} name="excerpt" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Краткий анонс</FormLabel>
                <FormControl><Textarea {...field} value={field.value || ""} className="rounded-none border-border min-h-[80px]" /></FormControl>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Полный текст (HTML)</FormLabel>
                <FormControl><Textarea {...field} value={field.value || ""} className="rounded-none border-border min-h-[300px]" /></FormControl>
              </FormItem>
            )} />
          </div>

          <Button type="submit" disabled={createArticle.isPending || updateArticle.isPending} className="w-full rounded-none bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider h-12">
            {isEditing ? "Сохранить изменения" : "Создать публикацию"}
          </Button>
        </form>
      </Form>
    </div>
  );
}