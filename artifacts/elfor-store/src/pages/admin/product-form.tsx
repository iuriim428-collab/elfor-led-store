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
import { Trash2, Plus, Upload, X, FileText, ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
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
  passportUrl: z.string().optional().nullable(),
  colorTempsRaw: z.string().optional().default(""),
  beamAnglesRaw: z.string().optional().default(""),
  specs: z.array(z.object({
    key: z.string().min(1),
    value: z.string().min(1),
    unit: z.string().optional().nullable()
  })).optional().default([]),
  variantStocks: z.array(z.object({
    kelvin: z.string(),
    stock: z.coerce.number().min(0).default(0)
  })).default([])
});

type UploadState = "idle" | "uploading" | "done" | "error";

interface FileUploadWidgetProps {
  label: string;
  accept: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  icon: React.ReactNode;
  hint?: string;
}

function FileUploadWidget({ label, accept, value, onChange, icon, hint }: FileUploadWidgetProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    setState("uploading");
    setFileName(file.name);
    try {
      const metaRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!metaRes.ok) throw new Error("Не удалось получить URL загрузки");
      const { uploadURL, objectPath } = await metaRes.json();

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Ошибка загрузки файла");

      onChange(objectPath);
      setState("done");
    } catch (err) {
      setState("error");
      toast({ title: "Ошибка загрузки", description: String(err), variant: "destructive" });
    }
  }, [onChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    onChange(null);
    setState("idle");
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  const isImage = accept.includes("image");
  const displayName = value
    ? (value.startsWith("/api/storage/") ? (fileName || value.split("/").pop() || "файл") : value.split("/").pop() || value)
    : "";

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase font-mono">{label}</label>

      {value ? (
        <div className="border border-border bg-card p-3 flex items-center gap-3">
          {isImage ? (
            <img src={value} alt="" className="h-16 w-16 object-contain bg-[#1a1a1a] shrink-0" />
          ) : (
            <div className="h-16 w-16 bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-accent" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs font-bold truncate">{displayName}</div>
            <div className="font-mono text-[10px] text-muted-foreground mt-0.5">загружено</div>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={handleRemove}
            className="rounded-none border-border shrink-0 h-8 w-8 text-destructive hover:bg-destructive/10">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer p-6 flex flex-col items-center justify-center gap-2 text-center"
        >
          {state === "uploading" ? (
            <>
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              <span className="font-mono text-xs text-muted-foreground">Загрузка {fileName}...</span>
            </>
          ) : state === "error" ? (
            <>
              {icon}
              <span className="font-mono text-xs text-destructive">Ошибка — нажмите чтобы повторить</span>
            </>
          ) : (
            <>
              <div className="text-muted-foreground">{icon}</div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Перетащите или нажмите
              </span>
              {hint && <span className="font-mono text-[10px] text-muted-foreground">{hint}</span>}
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  );
}

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
      specs: [],
      variantStocks: []
    }
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specs"
  });

  const { fields: variantFields } = useFieldArray({
    control: form.control,
    name: "variantStocks"
  });

  const colorTempsRaw = form.watch("colorTempsRaw");
  const variantStocks = form.watch("variantStocks");
  const watchedPrice = form.watch("price");

  const parsedColorTemps = useMemo(
    () => (colorTempsRaw || "").split(",").map(s => s.trim()).filter(Boolean),
    [colorTempsRaw]
  );

  const initRef = useRef(false);

  useEffect(() => {
    if (isEditing && product && !initRef.current) {
      const existingVariantStocks = Array.isArray(product.variantStocks) ? product.variantStocks : [];
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
        passportUrl: (product as { passportUrl?: string | null }).passportUrl ?? undefined,
        colorTempsRaw: (product.colorTemps ?? []).join(", "),
        beamAnglesRaw: (product.beamAngles ?? []).join(", "),
        specs: product.specs ?? [],
        variantStocks: existingVariantStocks as { kelvin: string; stock: number }[]
      });
      initRef.current = true;
    }
  }, [product, isEditing, form]);

  useEffect(() => {
    if (!initRef.current) return;
    const current = form.getValues("variantStocks") as { kelvin: string; stock: number }[];
    const currentMap = new Map(current.map(v => [v.kelvin, v.stock]));
    const next = parsedColorTemps.map(k => ({ kelvin: k, stock: currentMap.get(k) ?? 0 }));
    form.setValue("variantStocks", next, { shouldDirty: true });
  }, [colorTempsRaw]);

  const totalVariantStock = variantStocks.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const parseList = (raw: string | undefined) =>
      (raw || "").split(",").map(s => s.trim()).filter(Boolean);

    const colorTemps = parseList(values.colorTempsRaw);
    const hasVariants = colorTemps.length > 0 && values.variantStocks.length > 0;

    const autoTiers = values.price > 0 ? [
      { minQty: 5,  price: Math.round(values.price * 0.92 / 10) * 10 },
      { minQty: 20, price: Math.round(values.price * 0.85 / 10) * 10 },
    ] : undefined;

    const data = {
      ...values,
      priceTiers: autoTiers,
      oldPrice: values.oldPrice || undefined,
      shortDescription: values.shortDescription || undefined,
      fullDescription: values.fullDescription || undefined,
      power: values.power || undefined,
      lumens: values.lumens || undefined,
      colorTemp: values.colorTemp || undefined,
      ipRating: values.ipRating || undefined,
      warranty: values.warranty || undefined,
      imageUrl: values.imageUrl || undefined,
      passportUrl: values.passportUrl || undefined,
      colorTemps,
      beamAngles: parseList(values.beamAnglesRaw),
      colorTempsRaw: undefined,
      beamAnglesRaw: undefined,
      specs: values.specs.length > 0 ? values.specs.map(s => ({
        ...s,
        unit: s.unit || undefined
      })) : undefined,
      variantStocks: hasVariants ? values.variantStocks.map(v => ({ kelvin: v.kelvin, stock: Number(v.stock) })) : undefined,
      stock: hasVariants ? values.variantStocks.reduce((s, v) => s + Number(v.stock), 0) : values.stock
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
                <FormLabel className="text-xs font-bold uppercase">Цена (₽)</FormLabel>
                <FormControl><Input type="number" {...field} className="rounded-none border-border" /></FormControl>
                <FormMessage />
                {Number(watchedPrice) > 0 && (
                  <p className="text-[11px] text-muted-foreground font-mono mt-1">
                    Скидки (авто): от 5 шт → <span className="text-accent font-bold">{(Math.round(Number(watchedPrice) * 0.92 / 10) * 10).toLocaleString("ru-RU")} ₽</span>{" · "}
                    от 20 шт → <span className="text-accent font-bold">{(Math.round(Number(watchedPrice) * 0.85 / 10) * 10).toLocaleString("ru-RU")} ₽</span>
                  </p>
                )}
              </FormItem>
            )} />

            {parsedColorTemps.length > 0 ? (
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold uppercase font-mono">Остаток по цветовым температурам</label>
                <div className="border border-border overflow-hidden">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="text-left px-3 py-2 font-bold uppercase">Цветовая температура</th>
                        <th className="text-right px-3 py-2 font-bold uppercase">Остаток (шт.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantFields.map((field, index) => (
                        <tr key={field.id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-bold">{form.watch(`variantStocks.${index}.kelvin`)}</td>
                          <td className="px-2 py-1 text-right">
                            <FormField control={form.control} name={`variantStocks.${index}.stock`} render={({ field }) => (
                              <Input type="number" {...field} min={0} className="rounded-none border-border h-8 w-24 text-right ml-auto" />
                            )} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted border-t border-border">
                        <td className="px-3 py-2 font-bold uppercase text-xs">Итого</td>
                        <td className="px-3 py-2 text-right font-bold text-accent">{totalVariantStock} шт.</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <FormField control={form.control} name="stock" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase">Остаток</FormLabel>
                  <FormControl><Input type="number" {...field} className="rounded-none border-border" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            
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

              <FormField control={form.control} name="warranty" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase">Гарантия</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="Напр: 5 лет" className="rounded-none border-border" /></FormControl>
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
            <h3 className="font-serif font-bold uppercase text-sm border-b border-border pb-2">Описание и файлы</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FileUploadWidget
                    label="Фотография товара"
                    accept="image/*"
                    value={field.value}
                    onChange={field.onChange}
                    icon={<ImageIcon className="h-6 w-6" />}
                    hint="JPG, PNG, WebP — до 10 МБ"
                  />
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="passportUrl" render={({ field }) => (
                <FormItem>
                  <FileUploadWidget
                    label="Паспорт изделия (PDF)"
                    accept=".pdf,application/pdf"
                    value={field.value}
                    onChange={field.onChange}
                    icon={<FileText className="h-6 w-6" />}
                    hint="PDF — технический паспорт светильника"
                  />
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
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
