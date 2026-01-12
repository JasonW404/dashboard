import Link from 'next/link';
import { Home, ListTodo, BookOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background p-4">
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="h-8 w-8 rounded-lg bg-primary" />
        <span className="text-lg font-bold">Dashboard</span>
      </div>
      <nav className="flex flex-1 flex-col gap-2 pt-4">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link href="/todos">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <ListTodo className="h-4 w-4" />
            Todos
          </Button>
        </Link>
        <Link href="/blog">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <BookOpen className="h-4 w-4" />
            Blog
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </nav>
    </div>
  );
}
