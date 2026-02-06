import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Streamdown } from "streamdown";

export default function BlogArticle() {
  const params = useParams();
  const [, navigate] = useLocation();
  const slug = params?.slug as string;

  const { data, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-slate-50 dark:to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data?.article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-50 dark:to-slate-950">
        <div className="container py-12">
          <Button variant="outline" onClick={() => navigate("/blog")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">Article not found</p>
          </Card>
        </div>
      </div>
    );
  }

  const article = data.article;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-50 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4">
          <Button variant="outline" onClick={() => navigate("/blog")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <div className="container py-12">
        <article className="max-w-3xl mx-auto">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-full">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-border/30">
            {article.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
            )}
            {article.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <Card className="p-8 mb-8 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border-border/50">
            <div className="prose dark:prose-invert max-w-none">
              <Streamdown>{article.content}</Streamdown>
            </div>
          </Card>

          {/* Tags */}
          {article.tags && (
            <div className="flex flex-wrap gap-3 mb-8">
              {article.tags.split(",").map((tag: string) => (
                <div
                  key={tag.trim()}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Tag className="h-3 w-3" />
                  {tag.trim()}
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-border/50">
            <h3 className="text-xl font-bold mb-2">Ready to analyze your portfolio?</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your investments with advanced analytics and AI-powered recommendations.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
              Go to Dashboard
            </Button>
          </Card>
        </article>
      </div>
    </div>
  );
}
