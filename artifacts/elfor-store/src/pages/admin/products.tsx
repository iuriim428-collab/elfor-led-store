import { useListProducts, useDeleteProduct } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminProducts() {
  const { data: products = [], isLoading } = useListProducts();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить товар?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/products"] })
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif font-bold text-lg uppercase">Товары ({products.length})</h2>
        <Link href="/admin/products/new">
          <Button className="rounded-none bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider text-xs h-9">
            <Plus className="h-4 w-4 mr-2" /> Добавить
          </Button>
        </Link>
      </div>

      <div className="border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border">
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground w-16">ID</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Артикул</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Название</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Цена</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Остаток</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-sm">
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Загрузка...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Нет товаров</TableCell></TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="border-border">
                  <TableCell className="text-muted-foreground">{product.id}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="font-serif text-sm font-bold uppercase truncate max-w-[300px]">{product.name}</TableCell>
                  <TableCell>{product.price.toLocaleString("ru-RU")} ₽</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 border ${product.stock > 0 ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-red-500/10 text-red-700 border-red-500/20'}`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-border">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-border text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(product.id)}>
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