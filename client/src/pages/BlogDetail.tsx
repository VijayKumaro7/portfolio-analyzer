import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Calendar, User, Tag, Share2, Bookmark } from "lucide-react";
import { Streamdown } from "streamdown";
import { useState } from "react";

interface BlogDetailProps {
  slug: string;
}

export default function BlogDetail({ slug }: BlogDetailProps) {
  const [, setLocation] = useLocation();
  const [bookmarked, setBookmarked] = useState(false);

  const { data: articleData, isLoading, error } = trpc.blog.getBySlug.useQuery({
    slug,
  });

  const article = articleData?.article;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
          <div className="container py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/blog")}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </div>
        </div>
        <div className="container py-12">
          <div className="max-w-3xl mx-auto">
            <div className="h-12 bg-muted/50 rounded animate-pulse mb-4" />
            <div className="h-6 bg-muted/50 rounded animate-pulse mb-8 w-1/3" />
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
          <div className="container py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/blog")}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </div>
        </div>
        <div className="container py-12">
          <Card className="border border-border/50 bg-card/50 p-12 text-center">
            <p className="text-muted-foreground text-lg">Article not found.</p>
            <Button
              variant="outline"
              onClick={() => setLocation("/blog")}
              className="mt-4"
            >
              Return to Blog
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/blog")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <article className="max-w-3xl mx-auto">
          {/* Article Header */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                {article?.category}
              </span>
              {article?.tags && (
                <div className="flex gap-2 flex-wrap">
                  {article.tags.split(",").map((tag: string) => (
                    <span
                      key={tag.trim()}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full"
                    >
                      <Tag className="h-3 w-3" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {article?.title}
            </h1>

            <p className="text-lg text-muted-foreground">
              {article?.excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex items-center gap-6 pt-4 border-t border-border/30 flex-wrap">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{article?.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {article && new Date(article.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-invert max-w-none mb-12">
            <Card className="border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <Streamdown>{article?.content || ""}</Streamdown>
            </Card>
          </div>

          {/* Article Actions */}
          <div className="flex items-center gap-4 py-8 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBookmarked(!bookmarked)}
              className="gap-2"
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.share({
                  title: article?.title || "",
                  text: article?.excerpt || "",
                  url: window.location.href,
                }).catch(() => {
                  // Fallback: copy to clipboard
                  navigator.clipboard.writeText(window.location.href);
                });
              }}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Related Articles Section */}
          <div className="mt-16 pt-12 border-t border-border/30">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              More Articles
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card
                  key={i}
                  className="group cursor-pointer overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
                  onClick={() => setLocation("/blog")}
                >
                  <div className="p-6 space-y-3">
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                      Investment Strategies
                    </span>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      Explore More Articles
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Discover more insights and strategies to optimize your portfolio.
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
