'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedArticles = async () => {
      try {
        const data = await apiClient.getArticles();
        // Filter only published articles
        const publishedArticles = data.filter((article: Article) => article.status === 'PUBLISHED');
        setArticles(publishedArticles);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        // Fallback to mock data if API fails
        setArticles([
          {
            articleId: 'mock-1',
            title: 'Getting Started with 3D Printing',
            author: 'John Doe',
            content: 'A comprehensive guide for beginners in 3D printing',
            status: 'PUBLISHED',
            publishedAt: '2024-01-15T00:00:00Z',
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-01-15T00:00:00Z',
          },
          {
            articleId: 'mock-2',
            title: 'Safety Guidelines for Makerspace',
            author: 'Jane Smith',
            content: 'Important safety protocols to follow in the makerspace',
            status: 'PUBLISHED',
            publishedAt: '2024-01-10T00:00:00Z',
            createdAt: '2024-01-10T00:00:00Z',
            updatedAt: '2024-01-10T00:00:00Z',
          },
          {
            articleId: 'mock-3',
            title: 'Project Showcase: Arduino Weather Station',
            author: 'Mike Johnson',
            content: 'Learn how to build your own weather monitoring system',
            status: 'PUBLISHED',
            publishedAt: '2024-01-05T00:00:00Z',
            createdAt: '2024-01-05T00:00:00Z',
            updatedAt: '2024-01-05T00:00:00Z',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedArticles();
  }, []);

  // Generate excerpt from content (strip HTML for plain text excerpt)
  const getExcerpt = (content?: string) => {
    if (!content) return 'Read more to learn about this topic...';
    // Strip HTML tags for plain text excerpt
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  // Get display date (prefer publishedAt over createdAt)
  const getDisplayDate = (article: Article) => {
    return article.publishedAt || article.createdAt;
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/hero-background.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <main className="relative z-10 container mx-auto flex-1 p-8 space-y-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Articles</CardTitle>
              <CardDescription className="text-gray-200">
                Read articles, tutorials, and project guides from our community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-300">Loading articles...</div>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-300">No published articles available yet.</div>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {articles.map((article) => (
                    <Card key={article.articleId} className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white">{article.title}</CardTitle>
                        <CardDescription className="text-gray-200">{getExcerpt(article.content)}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                        <div className="text-sm text-gray-300">
                          <span>By {article.author || 'Anonymous'}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(getDisplayDate(article)).toLocaleDateString()}</span>
                        </div>
                        <Button variant="outline" className="border-white text-black hover:bg-white hover:text-black" asChild>
                          <Link href={`/articles/${article.articleId}`}>Read More</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

