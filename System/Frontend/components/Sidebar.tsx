"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings Management" },
  { href: "/admin/inventory", label: "Inventory Management" },
  { href: "/admin/members", label: "Members Management" },
  { href: "/admin/staff", label: "Staff Management" },
  { href: "/admin/articles", label: "Articles Management" },
  { href: "/admin/gallery", label: "Gallery Management" },
  { href: "/admin/workshops", label: "Workshops Management" },
  { href: "/admin/contacts", label: "Contact Management" },
  { href: "/admin/insights", label: "Insights and Reports" },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="border-r border-border h-full w-64 relative z-[70] bg-opacity-70" style={{backgroundColor: 'rgba(21, 93, 252)'}}>
      <nav className="px-2 space-y-1 pt-8 h-full flex flex-col justify-between">
        <div>
          <h2 className="text-white text-lg font-semibold mb-6 px-2">Administration Console</h2>
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
