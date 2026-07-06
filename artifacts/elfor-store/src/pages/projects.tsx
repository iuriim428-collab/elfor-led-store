import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
  const res = await fetch("/api/projects?published=true");
  if (!res.ok) {
    throw new Error("Не удалось загрузить проекты");
  }

  return res.json();
}

export default function Projects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", "public"],
    queryFn: fetchProjects,
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span>/</span>
        <span className="text-primary">Наши проекты</span>
      </div>

      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-black uppercase mb-6">Наши проекты</h1>
        <p className="font-mono text-muted-foreground leading-relaxed">
          Реализованные проекты ELFOR: объекты, на которых уже работают наши светильники.
        </p>
      </div>

      {isLoading ? (
        <div className="font-mono">Загрузка...</div>
      ) : projects.length === 0 ? (
        <div className="font-mono text-muted-foreground">Проекты пока не опубликованы</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <article key={project.id} className="group flex flex-col border border-border bg-card hover-elevate overflow-hidden">
              <div className="aspect-[16/10] bg-muted border-b border-border overflow-hidden">
                {project.imageUrl ? (
                  <img
                    src={resolveStorageUrl(project.imageUrl)}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-mono text-muted-foreground">
                    Фото проекта скоро появится
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="text-xs font-mono text-accent">
                  {new Date(project.createdAt).toLocaleDateString("ru-RU")}
                </div>
                <h2 className="font-serif font-bold text-2xl uppercase leading-tight">{project.title}</h2>
                {project.description && (
                  <p className="font-mono text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
