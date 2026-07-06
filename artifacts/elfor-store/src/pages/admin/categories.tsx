import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1, "Slug обязателен"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  sortOrder: z.coerce.number().default(0),
  isHidden: z.boolean().default(false),
});

type CategoryFormValues = z.infer<typeof formSchema>;

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useListCategories({ includeHidden: true });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      sortOrder: 0,
      isHidden: false,
    },
  });

  const handleEdit = (category: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    sortOrder?: number;
    isHidden: boolean;
  }) => {
    setEditingId(category.id);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || undefined,
      imageUrl: category.imageUrl || undefined,
      sortOrder: category.sortOrder || 0,
      isHidden: category.isHidden,
    });
    setIsOpen(true);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      sortOrder: 0,
      isHidden: false,
    });
    setIsOpen(true);
  };

  const invalidateCategories = () =>
    queryClient.invalidateQueries({
      predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "/api/categories",
    });

  const onSubmit = (values: CategoryFormValues) => {
    const data = {
      ...values,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
    };

    if (editingId) {
      updateCategory.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            void invalidateCategories();
            setIsOpen(false);
          },
        }
      );
      return;
    }

    createCategory.mutate(
      { data },
      {
        onSuccess: () => {
          void invalidateCategories();
          setIsOpen(false);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Удалить категорию? Это может повлиять на товары, привязанные к ней.")) {
      return;
    }

    deleteCategory.mutate(
      { id },
      {
        onSuccess: () => {
          void invalidateCategories();
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif font-bold text-lg uppercase">Категории ({categories.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleCreateNew}
              className="rounded-none bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider text-xs h-9"
            >
              <Plus className="h-4 w-4 mr-2" /> Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-border font-mono max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif uppercase">
                {editingId ? "Редактировать категорию" : "Новая категория"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase">Название</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase">Slug (URL)</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase">URL картинки</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="rounded-none border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isHidden"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between border border-border p-3">
                      <div className="space-y-1">
                        <FormLabel className="text-xs font-bold uppercase">Скрыть категорию</FormLabel>
                        <div className="text-[11px] text-muted-foreground">
                          Категория останется в админке, но исчезнет с сайта и из списка категорий.
                        </div>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="rounded-none border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="w-full rounded-none bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider mt-4"
                >
                  Сохранить
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border">
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground w-16">ID</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground w-20">Фото</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Название</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Slug</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Статус</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-sm">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Нет категорий
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="border-border">
                  <TableCell className="text-muted-foreground">{category.id}</TableCell>
                  <TableCell>
                    {category.imageUrl ? (
                      <div className="w-10 h-10 border border-border bg-white p-1 flex items-center justify-center">
                        <img src={category.imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 border border-border bg-muted flex items-center justify-center text-[8px] text-muted-foreground">
                        Нет
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-serif text-sm font-bold uppercase">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    {category.isHidden ? (
                      <span className="inline-flex border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Скрыта
                      </span>
                    ) : (
                      <span className="inline-flex border border-green-500/30 bg-green-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
                        Видима
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-none border-border"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-none border-border text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
