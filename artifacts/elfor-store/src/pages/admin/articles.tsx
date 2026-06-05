import { useListArticles, useDeleteArticle, useUpdateArticle } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

export default function AdminArticles() {
  const { data: articles = [], isLoading } = useListArticles();
  const deleteArticle = useDeleteArticle();
  const updateArticle = useUpdateArticle();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить статью?")) {
      deleteArticle.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/articles"] })
      });
    }
  };

  const handleTogglePublish = (id: number, published: boolean) => {
    updateArticle.mutate({ id, data: { published } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/articles"] })
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif font-bold text-lg uppercase">Статьи и новости ({articles.length})</h2>
        <Link href="/admin/articles/new">
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
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground w-24">Тип</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Заголовок</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground w-24 text-center">Опубл.</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-sm">
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Загрузка...</TableCell></TableRow>
            ) : articles.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Нет статей</TableCell></TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} className="border-border">
                  <TableCell className="text-muted-foreground">{article.id}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 bg-muted border border-border text-xs uppercase">{article.type === 'news' ? 'Новость' : 'Статья'}</span>
                  </TableCell>
                  <TableCell className="font-serif text-sm font-bold uppercase truncate max-w-[400px]">{article.title}</TableCell>
                  <TableCell className="text-center">
                    <Switch 
                      checked={article.published} 
                      onCheckedChange={(val) => handleTogglePublish(article.id, val)} 
                      className="data-[state=checked]:bg-accent"
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/articles/${article.id}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-border">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-border text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(article.id)}>
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