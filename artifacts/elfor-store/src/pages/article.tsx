import { getGetArticleQueryKey, useGetArticle } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";

export default function Article() {
  const { id } = useParams();
  const articleId = parseInt(id!);
  
  const { data: article, isLoading } = useGetArticle(articleId, {
    query: { enabled: !!articleId, queryKey: getGetArticleQueryKey(articleId) },
  });

  if (isLoading) return <div className="p-24 text-center font-mono">Загрузка...</div>;
  if (!article) return <div className="p-24 text-center font-mono text-destructive">Статья не найдена</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span>/</span>
        <Link href="/news" className="hover:text-primary">Новости</Link>
        <span>/</span>
        <span className="text-primary truncate max-w-[200px]">{article.title}</span>
      </div>

      <div className="text-xs font-mono text-accent mb-4">{new Date(article.createdAt).toLocaleDateString('ru-RU')}</div>
      <h1 className="text-3xl md:text-5xl font-serif font-black uppercase mb-12 leading-tight">{article.title}</h1>

      {article.imageUrl && (
        <div className="mb-12 border border-border">
          <img src={article.imageUrl} alt={article.title} className="w-full object-cover max-h-[500px]" />
        </div>
      )}

      <div className="prose prose-neutral max-w-none font-mono">
        {article.content ? (
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          <p>{article.excerpt}</p>
        )}
      </div>
    </div>
  );
}
