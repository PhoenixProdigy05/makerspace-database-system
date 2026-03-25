"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/staff/dashboard", label: "Dashboard" },
  { href: "/staff/bookings", label: "Bookings Management" },
  { href: "/staff/inventory", label: "Inventory Management" },
  { href: "/staff/articles", label: "Articles Management" },
  { href: "/staff/gallery", label: "Gallery Management" },
  { href: "/staff/workshops", label: "Workshops Management" },
  { href: "/staff/contacts", label: "Contact Management" },
];

type StaffSidebarProps = {
  onNavigate?: () => void;
};

export function StaffSidebar({ onNavigate }: StaffSidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="border-r border-border h-full w-64 relative z-[70]" style={{backgroundColor: 'rgba(21, 93, 252)'}}>
      <nav className="px-2 space-y-1 pt-8 h-full flex flex-col justify-between">
        <div>
          <h2 className="text-white text-lg font-semibold mb-6 px-2">Staff Operations</h2>
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
