'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Objective } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, LayoutList, Kanban } from 'lucide-react';
import { VisionBoard } from '@/components/todos/VisionBoard';
import { OKRList } from '@/components/todos/OKRList';
import { TimeBucketKanban } from '@/components/todos/TimeBucketKanban';
import { CreateItemDialog } from '@/components/todos/CreateItemDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MotionContainer, MotionItem } from '@/components/layout/MotionWrapper';

interface TodosClientProps {
    initialObjectives: Objective[];
}

export function TodosClient({ initialObjectives }: TodosClientProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [view, setView] = useState<'list' | 'kanban'>('list');

    return (
        <div className="space-y-8">
            <MotionContainer>
                <MotionItem className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">TODO</h1>
                    <p className="text-muted-foreground">
                        OKR and Vision Board
                    </p>
                </MotionItem>
                <MotionItem>
                    <div className="flex justify-between items-center">
                        <div className="flex bg-muted rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2 h-8 transition-all",
                                    view === 'list'
                                        ? "bg-background text-foreground shadow-sm hover:bg-background"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setView('list')}
                            >
                                <LayoutList className="w-4 h-4" /> List
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2 h-8 transition-all",
                                    view === 'kanban'
                                        ? "bg-background text-foreground shadow-sm hover:bg-background"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setView('kanban')}
                            >
                                <Kanban className="w-4 h-4" /> Timeline
                            </Button>
                        </div>

                        <Button onClick={() => setIsCreateOpen(true)} size="sm">
                            <Plus className="w-4 h-4 mr-2" /> New North Star
                        </Button>
                    </div>
                </MotionItem>
            </MotionContainer>

            <MotionItem>
                <VisionBoard objectives={initialObjectives} />
            </MotionItem>

            <MotionItem>
                {view === 'list' ? (
                    <OKRList objectives={initialObjectives} />
                ) : (
                    <TimeBucketKanban objectives={initialObjectives} />
                )}
            </MotionItem>

            <CreateItemDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                type="objective"
            />
        </div>
    );
}
