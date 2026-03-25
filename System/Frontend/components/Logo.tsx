'use client';

import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <img 
        src="/makerspace-logo.png" 
        alt="UG Makerspace Logo" 
        className="h-16 w-auto"
      />
    </Link>
  );
}

