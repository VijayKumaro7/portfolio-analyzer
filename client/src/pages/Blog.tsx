import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Search, Calendar, User, Tag, ChevronLeft, ArrowRight } from "lucide-react";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [, setLocation] = useLocation();

  const { data: articlesData, isLoading: isLoadingList } = trpc.blog.list.useQuery({
    limit: 12,
    offset: currentPage * 12,
  });

  const { data: searchData, isLoading: isLoadingSearch } = trpc.blog.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const { data: categoryData } = trpc.blog.getByCategory.useQuery(
    { category: selectedCategory || "" },
    { enabled: selectedCategory !== null }
  );

  const { data: featuredData } = trpc.blog.featured.useQuery({
    limit: 3,
  });

  const articles = useMemo(() => {
    if (searchQuery.length > 0 && searchData) {
      return searchData.articles;
    }
    if (selectedCategory && categoryData) {
      return categoryData.articles;
    }
    return articlesData?.articles || [];
  }, [searchQuery, searchData, selectedCategory, categoryData, articlesData]);

  const categories = [
    "Portfolio Management",
    "Investment Strategies",
    "Market Analysis",
    "Risk Management",
    "Cryptocurrency",
    "Technical Analysis",
  ];

  const isLoading = isLoadingSearch || isLoadingList;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-out">
        <div className="container py-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="gap-2 transition-all duration-300 ease-out hover:scale-105 hover:-translate-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Investment Blog & Resources
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="pl-10 py-6 text-base transition-all duration-300 ease-out focus:scale-105 focus:shadow-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Categories</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentPage(0);
                }}
                className="transition-all duration-300 ease-out hover:scale-105"
              >
                All Articles
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(0);
                  }}
                  className="transition-all duration-300 ease-out hover:scale-105"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Featured Articles Section */}
        {!searchQuery && !selectedCategory && featuredData?.articles && featuredData.articles.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Featured Articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredData.articles.map((article: any, index: number) => (
                <Card
                  key={article.id}
                  className="group cursor-pointer overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 hover:scale-105"
                  onClick={() => setLocation(`/blog/${article.slug}`)}
                  style={{
                    animation: `fade-in 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            {searchQuery ? "Search Results" : selectedCategory ? selectedCategory : "All Articles"}
          </h2>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="h-64 bg-muted/50 animate-pulse"
                />
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article: any, index: number) => (
                <Card
                  key={article.id}
                  className="group cursor-pointer overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 hover:scale-105"
                  onClick={() => setLocation(`/blog/${article.slug}`)}
                  style={{
                    animation: `fade-in 0.5s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className="p-6 space-y-4 h-full flex flex-col">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                          {article.category}
                        </span>
                        {article.tags && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            {article.tags.split(",")[0].trim()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-border/50 bg-card/50 p-12 text-center">
              <p className="text-muted-foreground">No articles found. Try a different search or category.</p>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {!searchQuery && !selectedCategory && articlesData && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={articles.length < 12}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags?: string;
  author: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
