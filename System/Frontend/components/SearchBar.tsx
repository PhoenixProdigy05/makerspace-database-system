'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

interface InventoryItem {
  itemId: string;
  name: string;
  sku: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<InventoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!query.trim() || !isAuthenticated) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const items = await apiClient.getInventoryItems();
        const filtered = items.filter((item: InventoryItem) => {
          const searchTerm = query.toLowerCase();
          return (
            item.name?.toLowerCase().includes(searchTerm) ||
            item.sku?.toLowerCase().includes(searchTerm)
          );
        });
        setResults(filtered.slice(0, 5)); // Limit to 5 results
        setIsOpen(filtered.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, isAuthenticated]);

  const handleItemClick = (itemId: string) => {
    router.push(`/inventory/${itemId}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return null; // Don't show search for unauthenticated users
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md mx-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search inventory..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.itemId}
              onClick={() => handleItemClick(item.itemId)}
              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0"
            >
              <div className="font-medium">{item.name}</div>
              {item.sku && (
                <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg p-4 text-center text-muted-foreground">
          No results found
        </div>
      )}
    </div>
  );
}

