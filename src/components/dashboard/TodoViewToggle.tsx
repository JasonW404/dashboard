"use client";

import { List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TodoViewToggleProps {
  view: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
}

export function TodoViewToggle({ view, onViewChange }: TodoViewToggleProps) {
  return (
    <div className="flex gap-2 rounded-lg bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          "gap-2",
          view === 'list' && "bg-background shadow-sm"
        )}
      >
        <List className="h-4 w-4" />
        List View
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('kanban')}
        className={cn(
          "gap-2",
          view === 'kanban' && "bg-background shadow-sm"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Kanban View
      </Button>
    </div>
  );
}
