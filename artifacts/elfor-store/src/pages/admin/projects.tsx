import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
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

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) {
    throw new Error("Не удалось загрузить проекты");
  }

  return res.json();
}

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const deleteProject = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Не удалось удалить проект");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, published }: { id: number; published: boolean }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });

      if (!res.ok) {
        throw new Error("Не удалось обновить проект");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const handleDelete = (id: number) => {
    if (!confirm("Удалить проект?")) {
      return;
    }

    deleteProject.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif font-bold text-lg uppercase">Проекты ({projects.length})</h2>
        <Link href="/projects/new">
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
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground w-24">Фото</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground">Название</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground w-24 text-center">Видимость</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase text-muted-foreground text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-sm">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Загрузка...</TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Проектов пока нет</TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id} className="border-border">
                  <TableCell className="text-muted-foreground">{project.id}</TableCell>
                  <TableCell>
                    {project.imageUrl ? (
                      <div className="w-14 h-10 border border-border bg-muted overflow-hidden">
                        <img
                          src={resolveStorageUrl(project.imageUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-10 border border-border bg-muted flex items-center justify-center text-[8px] text-muted-foreground">
                        Нет
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-serif text-sm font-bold uppercase">{project.title}</div>
                    {project.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={project.published}
                      onCheckedChange={(value) => updateProject.mutate({ id: project.id, published: value })}
                      className="data-[state=checked]:bg-accent"
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-border">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-none border-border text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(project.id)}
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
