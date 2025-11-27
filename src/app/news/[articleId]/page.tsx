import ArticleClientPage from "./ArticleClientPage";

// The page component is now async to align with modern Next.js patterns
// for handling route parameters, resolving the server-side error.
export default async function ArticlePage({ params }: { params: { articleId: string } }) {
  const { articleId } = params;

  return <ArticleClientPage articleId={articleId} />;
}
