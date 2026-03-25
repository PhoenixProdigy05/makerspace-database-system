'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { StaffSidebar } from '@/components/StaffSidebar';
import { Sidebar as AdminSidebar } from '@/components/Sidebar';
import { MemberSidebar } from '@/components/MemberSidebar';
import { useState } from 'react';
import GalleryCarousel from '@/components/GalleryCarousel';
import SplitText from '@/components/SplitText';
import TextType from '@/components/TextType';
import { FaLinkedin, FaTiktok, FaInstagram, FaLink } from 'react-icons/fa';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/hero-background.jpg")',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Sidebar - Only show for authenticated users */}
        {isAuthenticated && sidebarOpen && (
          <div className="fixed inset-0 z-[100] flex">
            <div className="bg-card shadow-lg h-full w-64">
              {user?.role === 'Staff' && (
                <StaffSidebar onNavigate={() => setSidebarOpen(false)} />
              )}
              {user?.role === 'Admin' && (
                <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
              )}
              {user?.role === 'Member' && (
                <MemberSidebar onNavigate={() => setSidebarOpen(false)} />
              )}
            </div>
            <div
              className="flex-1 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Sidebar Icon - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="absolute top-8 left-8 z-20">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 w-16 h-16 p-0"
            >
              <span className="text-2xl">≡</span>
            </Button>
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <SplitText
              text="Welcome to Makerspace"
              className="text-5xl md:text-7xl font-bold text-white"
              delay={60}
              duration={2}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              tag="h1"
            />
          </div>

          <div className="mb-8">
            <TextType 
              text={[
                "Discover, create, and innovate in our collaborative workspace.",
                "Access cutting-edge equipment and join a community of makers."
              ]}
              typingSpeed={50}
              pauseDuration={3000}
              deletingSpeed={30}
              showCursor={false}
              className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto"
              as="p"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/inventory">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Explore Inventory
              </Button>
            </Link>
            <Link href="/workshops">
              <Button size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-black px-8 py-3 text-lg">
                View Workshops
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <SplitText
              text="Our Gallery"
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              delay={50}
              duration={1.5}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="center"
              tag="h2"
            />
          </div>
          <GalleryCarousel className="w-full border-8 border-gray-200 rounded-lg shadow-2xl" />
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Join our communities</h2>
            
            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-lg">
                About
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-lg">
                Contact
              </Link>
              <Link href="/articles" className="text-gray-300 hover:text-white transition-colors text-lg">
                Articles
              </Link>
            </div>

            {/* Social Media Links */}
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href="https://www.linkedin.com/in/ug-makerspace" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <FaLinkedin className="w-5 h-5" />
                <span>ug_makerspace</span>
              </a>
              <a 
                href="https://www.tiktok.com/@ug_makerspace" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <FaTiktok className="w-5 h-5" />
                <span>ug_makerspace</span>
              </a>
              <a 
                href="https://www.instagram.com/ug_makerspace" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <FaInstagram className="w-5 h-5" />
                <span>ug_makerspace</span>
              </a>
              <a 
                href="https://linktr.ee/ugmakerspace" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <FaLink className="w-5 h-5" />
                <span>ugmakerspace</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
