"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListTodo, BookOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/todos', label: 'Todos', icon: ListTodo },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background p-4">
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="h-8 w-8 rounded-lg bg-primary" />
        <span className="text-lg font-bold">Dashboard</span>
      </div>
      <nav className="flex flex-1 flex-col gap-2 pt-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button 
              variant={pathname === href ? "secondary" : "ghost"} 
              className={cn(
                "w-full justify-start gap-2",
                pathname === href && "bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}
