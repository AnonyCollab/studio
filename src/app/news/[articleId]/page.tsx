import ArticleClientPage from "./ArticleClientPage";

export default function ArticlePage({ params }: { params: { articleId: string } }) {
  // This is now a Server Component. It safely extracts the articleId from params.
  const { articleId } = params;

  // It then passes the ID as a simple prop to the Client Component.
  return <ArticleClientPage articleId={articleId} />;
}
