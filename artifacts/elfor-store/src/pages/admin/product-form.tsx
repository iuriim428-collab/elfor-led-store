import { useListCategories, useCreateProduct, useUpdateProduct, useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  sku: z.string().min(1, "Артикул обязателен"),
  categoryId: z.coerce.number().min(1, "Категория обязательна"),
  price: z.coerce.number().min(0),
  oldPrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().min(0).default(0),
  featured: z.boolean().default(false),
  shortDescription: z.string().optional().nullable(),
  fullDescription: z.string().optional().nullable(),
  power: z.string().optional().nullable(),
  lumens: z.coerce.number().optional().nullable(),
  colorTemp: z.string().optional().nullable(),
  ipRating: z.string().optional().nullable(),
  warranty: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  colorTempsRaw: z.string().optional().default(""),
  beamAnglesRaw: z.string().optional().default(""),
  specs: z.array(z.object({
    key: z.string().min(1),
    value: z.string().min(1),
    unit: z.string().optional().nullable()
  })).optional().default([])
});

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id && id !== "new";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useListCategories();
  const { data: product, isLoading: isLoadingProduct } = useGetProduct(parseInt(id!), { 
    query: { enabled: isEditing } 
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      categoryId: 0,
      price: 0,
      stock: 10,
      featured: false,
      specs: []
    }
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specs"
  });

  const initRef = useRef(false);

  useEffect(() => {
    if (isEditing && product && !initRef.current) {
      form.reset({
        ...product,
        oldPrice: product.oldPrice ?? undefined,
        shortDescription: product.shortDescription ?? undefined,
        fullDescription: product.fullDescription ?? undefined,
        power: product.power ?? undefined,
        lumens: product.lumens ?? undefined,
        colorTemp: product.colorTemp ?? undefined,
        ipRating: product.ipRating ?? undefined,
        warranty: product.warranty ?? undefined,
        imageUrl: product.imageUrl ?? undefined,
        colorTempsRaw: (product.colorTemps ?? []).join(", "),
        beamAnglesRaw: (product.beamAngles ?? []).join(", "),
        specs: product.specs ?? []
      });
      initRef.current = true;
    }
  }, [product, isEditing, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const parseList = (raw: string | undefined) =>
      (raw || "").split(",").map(s => s.trim()).filter(Boolean);

    const data = {
      ...values,
      oldPrice: values.oldPrice || undefined,
      shortDescription: values.shortDescription || undefined,
      fullDescription: values.fullDescription || undefined,
      power: values.power || undefined,
      lumens: values.lumens || undefined,
      colorTemp: values.colorTemp || undefined,
      ipRating: values.ipRating || undefined,
      warranty: values.warranty || undefined,
      imageUrl: values.imageUrl || undefined,
      colorTemps: parseList(values.colorTempsRaw),
      beamAngles: parseList(values.beamAnglesRaw),
      colorTempsRaw: undefined,
      beamAnglesRaw: undefined,
      specs: values.specs.length > 0 ? values.specs.map(s => ({
        ...s,
        unit: s.unit || undefined
      })) : undefined
    };

    if (isEditing) {
      const productId = parseInt(id!);
      updateProduct.mutate({ id: productId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) });
          toast({ title: "Товар обновлен" });
          setLocation("/products");
        }
      });
    } else {
      createProduct.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          toast({ title: "Товар создан" });
          setLocation("/products");
        }
      });
    }
  };

  if (isEditing && isLoadingProduct) return <div>Загрузка...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="font-serif font-bold text-lg uppercase">{isEditing ? "Редактирование товара" : "Новый товар"}</h2>
        <Button variant="outline" onClick={() => setLocation("/products")} className="rounded-none border-border font-mono text-xs">
          Отмена
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border bg-card">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-xs font-bold uppercase">Название</FormLabel>
                <FormControl><Input {...field} className="rounded-none border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sku" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Артикул</FormLabel>
                <FormControl><Input {...field} className="rounded-none border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Категория</FormLabel>
                <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                  <FormControl>
                    <SelectTrigger className="rounded-none border-border">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-none border-border font-mono">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Цена</FormLabel>
                <FormControl><Input type="number" {...field} className="rounded-none border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="stock" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Остаток</FormLabel>
                <FormControl><Input type="number" {...field} className="rounded-none border-border" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="featured" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-none border border-border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="rounded-none border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-xs font-bold uppercase">Популярный товар</FormLabel>
                  <p className="text-[10px] text-muted-foreground">Показывать на главной странице</p>
                </div>
              </FormItem>
            )} />
          </div>

          <div className="p-6 border border-border bg-card space-y-6">
            <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-2">Основные характеристики</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="power" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase">Мощность (Вт)</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} className="rounded-none border-border" /></FormControl>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="lumens" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase">Световой поток (лм)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value || ""} className="rounded-none border-border" /></FormControl>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="colorTemp" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase">Цветовая температура</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="Напр: 4000–4500K" className="rounded-none border-border" /></FormControl>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="ipRating" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase">Степень защиты (IP)</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="Напр: IP65" className="rounded-none border-border" /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="colorTempsRaw" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs font-bold uppercase">Варианты цветовой температуры (Кельвины)</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="3000K, 4000K, 5000K, 6000K" className="rounded-none border-border" /></FormControl>
                  <p className="text-[10px] text-muted-foreground">Через запятую. Покупатель выберет нужный вариант на странице товара.</p>
                </FormItem>
              )} />

              <FormField control={form.control} name="beamAnglesRaw" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs font-bold uppercase">Варианты угла свечения</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="60°, 90°, 120°" className="rounded-none border-border" /></FormControl>
                  <p className="text-[10px] text-muted-foreground">Через запятую. Покупатель выберет нужный угол на странице товара.</p>
                </FormItem>
              )} />
            </div>
          </div>

          <div className="p-6 border border-border bg-card space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-serif font-bold uppercase text-sm">Дополнительные характеристики</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ key: "", value: "", unit: "" })} className="rounded-none border-border h-8 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Добавить
              </Button>
            </div>
            
            {specFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <FormField control={form.control} name={`specs.${index}.key`} render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl><Input {...field} placeholder="Название (напр: Угол рассеивания)" className="rounded-none border-border" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name={`specs.${index}.value`} render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl><Input {...field} placeholder="Значение (напр: 120)" className="rounded-none border-border" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name={`specs.${index}.unit`} render={({ field }) => (
                  <FormItem className="w-24">
                    <FormControl><Input {...field} value={field.value || ""} placeholder="Ед.изм (град)" className="rounded-none border-border" /></FormControl>
                  </FormItem>
                )} />
                <Button type="button" variant="outline" size="icon" onClick={() => removeSpec(index)} className="rounded-none border-border text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="p-6 border border-border bg-card space-y-6">
            <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-2">Описание и фото</h3>
            
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">URL картинки</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} className="rounded-none border-border" /></FormControl>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="shortDescription" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Краткое описание</FormLabel>
                <FormControl><Textarea {...field} value={field.value || ""} className="rounded-none border-border min-h-[80px]" /></FormControl>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="fullDescription" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase">Полное описание (поддерживает HTML)</FormLabel>
                <FormControl><Textarea {...field} value={field.value || ""} className="rounded-none border-border min-h-[160px]" /></FormControl>
              </FormItem>
            )} />
          </div>

          <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="w-full rounded-none bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider h-12">
            {isEditing ? "Сохранить изменения" : "Создать товар"}
          </Button>
        </form>
      </Form>
    </div>
  );
}