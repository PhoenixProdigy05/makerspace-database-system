"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/member/dashboard", label: "Dashboard" },
  { href: "/member/equipment", label: "Equipment Catalogue" },
  { href: "/member/bookings", label: "My Bookings" },
  { href: "/member/workshops", label: "Workshops / Events" },
  { href: "/member/projects", label: "My Projects" },
];

type MemberSidebarProps = {
  onNavigate?: () => void;
};

export function MemberSidebar({ onNavigate }: MemberSidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="border-r border-border h-full w-64 relative z-[70]" style={{backgroundColor: 'rgba(21, 93, 252)'}}>
      <nav className="px-2 space-y-1 pt-8 h-full flex flex-col justify-between">
        <div>
          <h2 className="text-white text-lg font-semibold mb-6 px-2">Member Workspace</h2>
          <div className="flex flex-col space-y-1">
        {items.map((it) => (
          <Link key={it.href} href={it.href}>
            <Button
              variant={pathname?.startsWith(it.href) ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onNavigate?.();
              }}
            >
              {it.label}
            </Button>
          </Link>
        ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
