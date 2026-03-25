'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface GalleryItem {
  galleryId: string;
  title: string;
  description?: string;
  imageData: string; // Base64 image data
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface GalleryCarouselProps {
  className?: string;
}

export default function GalleryCarousel({ className = '' }: GalleryCarouselProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      console.log('GalleryCarousel: Starting fetch...');
      try {
        const items = await apiClient.getPublicGalleryItems();
        console.log('GalleryCarousel: Fetched items:', items);
        // Sort by order field
        const sortedItems = items.sort((a: GalleryItem, b: GalleryItem) => a.order - b.order);
        setGalleryItems(sortedItems);
      } catch (error) {
        console.error('Failed to fetch gallery items:', error);
        // Fallback to mock data for development
        setGalleryItems([
          {
            galleryId: 'mock-1',
            title: 'Makerspace Community',
            description: 'Our vibrant community of creators and innovators',
            imageData: '/gallery-placeholder-1.jpg',
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            galleryId: 'mock-2',
            title: '3D Printing Workshop',
            description: 'Members learning advanced 3D printing techniques',
            imageData: '/gallery-placeholder-2.jpg',
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            galleryId: 'mock-3',
            title: 'Laser Cutting Projects',
            description: 'Amazing projects created with our laser cutters',
            imageData: '/gallery-placeholder-3.jpg',
            order: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? galleryItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === galleryItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (galleryItems.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, galleryItems.length]);

  if (loading) {
    return (
      <div className={`w-full h-96 bg-gray-200 animate-pulse ${className}`} />
    );
  }

  if (galleryItems.length === 0) {
    return null; // Don't show gallery if no items
  }

  const currentItem = galleryItems[currentIndex];
  const previousIndex = currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === galleryItems.length - 1 ? 0 : currentIndex + 1;

  return (
    <div className={`relative w-full h-96 overflow-hidden bg-gray-200 ${className}`}>
      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={currentItem.imageData}
          alt={currentItem.title}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          onError={(e) => {
            console.error('GalleryCarousel: Image failed to load:', currentItem.imageData.substring(0, 50) + '...');
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = '/hero-background.jpg';
          }}
        />
        
        {/* Image Description */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">{currentItem.title}</h3>
          {currentItem.description && (
            <p className="text-lg opacity-90">{currentItem.description}</p>
          )}
        </div>
      </div>

      
      
      {/* Navigation Arrows */}
      {galleryItems.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {galleryItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {galleryItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-blue-500 w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
