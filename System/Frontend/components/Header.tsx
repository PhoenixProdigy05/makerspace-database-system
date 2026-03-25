'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user, isAuthenticated, logout, isFirstLogin } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/workshops', label: 'Workshops' },
    { href: '/articles', label: 'Articles' },
    { href: '/contact', label: 'Contact' },
  ];
  const role = (user?.role || '').toLowerCase();
  const firstName = (user?.fullName || '').split(' ')[0] || '';
  const profileHref =
    role === 'admin'
      ? '/admin/profile'
      : role === 'staff'
      ? '/staff/profile'
      : '/member/profile';
  const greetingText = isAuthenticated
    ? `${isFirstLogin ? 'Welcome' : 'Welcome back'} ${firstName || user?.fullName || ''}`
    : '';

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  className="relative"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Search Bar - Only show when authenticated */}
          {isAuthenticated && (
            <div className="hidden md:block flex-1 max-w-md">
              <SearchBar />
            </div>
          )}

          {/* Auth Buttons / User Info */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {greetingText && (
                  <span className="text-sm text-muted-foreground">
                    {greetingText}
                  </span>
                )}
                <div className="relative" ref={profileMenuRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex items-center justify-center"
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    aria-label="Profile menu"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-md border border-border bg-card shadow-md z-50">
                      <Link href={profileHref}>
                        <div
                          className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          Profile
                        </div>
                      </Link>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-2">
            {/* Mobile Search */}
            {isAuthenticated && (
              <div className="px-2 pb-2">
                <SearchBar />
              </div>
            )}

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Info */}
            {isAuthenticated && (
              <div className="px-2 pt-2 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">
                  {greetingText || ((firstName || user?.fullName) || '')} ({user?.role})
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

