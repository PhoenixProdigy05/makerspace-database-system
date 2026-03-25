'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface Article {
  articleId: string;
  title: string;
  author: string;
  imageUrl?: string;
  content?: string;
  tags?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await apiClient.getArticle(articleId);
        // Only show published articles to public users
        if (data.status !== 'PUBLISHED') {
          setNotFound(true);
          return;
        }
        setArticle(data);
      } catch (error) {
        console.error('Failed to fetch article:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
        <main className="container mx-auto flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center py-16">
              <div className="text-muted-foreground">Loading article...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
        <main className="container mx-auto flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Article Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The article you're looking for doesn't exist or is not yet published.
                </p>
                <Button asChild>
                  <Link href="/articles">Back to Articles</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const getDisplayDate = () => {
    return article.publishedAt || article.createdAt;
  };

  const formatTags = (tags?: string) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <main className="container mx-auto flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/articles">← Back to Articles</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl mb-4">{article.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {article.author || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(getDisplayDate()).toLocaleDateString()}</span>
                {article.publishedAt && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">Published</span>
                  </>
                )}
              </div>
              {formatTags(article.tags).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formatTags(article.tags).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {article.imageUrl && (
                <div className="mb-6">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full max-h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {article.content ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: article.content }} 
                    className="article-content"
                  />
                ) : (
                  <p className="text-muted-foreground">No content available for this article.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
