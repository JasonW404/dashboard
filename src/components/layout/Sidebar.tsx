"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListTodo, BookOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary shadow-lg shadow-primary/20" />
        <span className="text-lg font-bold tracking-tight">Dashboard</span>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <div className="relative group">
              {pathname === href && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-secondary rounded-md"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-3 relative z-10 transition-all duration-300",
                  pathname === href ? "font-medium" : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                  pathname === href && "text-primary"
                )} />
                {label}
              </Button>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
