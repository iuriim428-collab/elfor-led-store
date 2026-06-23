import { useListArticles } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function News() {
  const { data: articles = [], isLoading } = useListArticles({ published: true });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span>/</span>
        <span className="text-primary">Новости и статьи</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-serif font-black uppercase mb-12">Новости</h1>

      {isLoading ? (
        <div className="font-mono">Загрузка...</div>
      ) : articles.length === 0 ? (
        <div className="font-mono text-muted-foreground">Новостей пока нет</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link key={article.id} href={`/news/${article.id}`} className="group flex flex-col border border-border bg-background hover-elevate">
              {article.imageUrl && (
                <div className="aspect-video border-b border-border overflow-hidden bg-muted">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="text-xs font-mono text-accent mb-3">{new Date(article.createdAt).toLocaleDateString('ru-RU')}</div>
                <h3 className="font-serif font-bold text-lg uppercase leading-tight mb-3 group-hover:text-accent transition-colors">{article.title}</h3>
                {article.excerpt && <p className="text-sm font-mono text-muted-foreground line-clamp-3">{article.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
