"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  Gift,
  Banknote,
  FileText,
  MessageCircle,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/attendance", label: "Attendance", icon: Clock },
  { href: "/leaves", label: "Leaves", icon: CalendarDays },
  { href: "/compoff", label: "Comp-Off", icon: Gift },
  { href: "/encash", label: "Encash Leaves", icon: Banknote },
  { href: "/policies", label: "Policies", icon: FileText },
  { href: "/support", label: "Zara AI", icon: MessageCircle },
];

export function Navigation({ employee }: { employee: any }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            H
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">HRBuddy</h1>
            <p className="text-xs text-muted-foreground">NovaTech Solutions</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {employee?.isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="text-xs bg-secondary">
              {employee?.firstName?.[0]}
              {employee?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">
              {employee?.firstName} {employee?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{employee?.employeeId}</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST" className="w-full">
          <Button variant="outline" size="sm" className="w-full" type="submit">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </form>
      </div>
    </aside>
  );
}
