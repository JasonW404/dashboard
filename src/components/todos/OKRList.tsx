'use client';

import { useState } from 'react';
import { Objective, KeyResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    ChevronDown,
    ChevronRight,
    Plus,
    Trash2,
    MoreVertical,
    Target,
    Calendar as CalendarIcon,
    HelpCircle,
    Pencil
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toggleKeyResult, deleteKeyResult, deleteObjective, updateObjective, updateKeyResult, toggleObjective } from '@/actions/okr';
import { CreateItemDialog } from './CreateItemDialog';
import { GoldenCircleDialog } from './GoldenCircleDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OKRListProps {
    objectives: Objective[];
}

export function OKRList({ objectives }: OKRListProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [createKRFor, setCreateKRFor] = useState<string | null>(null);

    // Golden Circle State
    const [editingGC, setEditingGC] = useState<{
        id: string;
        type: 'objective' | 'key_result';
        title: string;
        data: { why?: string | null; how?: string | null; what?: string | null };
    } | null>(null);

    // Edit Item State
    const [editingItem, setEditingItem] = useState<{
        id: string;
        type: 'objective' | 'key_result';
        initialData: any;
    } | null>(null);

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDeleteObjective = async (id: string) => {
        if (confirm('Delete this objective and all its key results?')) {
            await deleteObjective(id);
            toast.success('Objective deleted');
        }
    };

    const handleToggleKR = async (id: string) => {
        await toggleKeyResult(id);
    };

    const handleDeleteKR = async (id: string) => {
        await deleteKeyResult(id);
        toast.success('Key Result deleted');
    };

    const handleSaveGC = async (data: any) => {
        if (!editingGC) return;
        if (editingGC.type === 'objective') {
            await updateObjective(editingGC.id, data);
        } else {
            await updateKeyResult(editingGC.id, data);
        }
        toast.success('Golden Circle updated');
    };

    const calculateProgress = (obj: Objective) => {
        const total = obj.keyResults.length;
        if (total === 0) return obj.completed ? 100 : 0;
        const completed = obj.keyResults.filter((kr) => kr.completed).length;
        return Math.round((completed / total) * 100);
    };

    return (
        <div className="space-y-4">
            {objectives.map((obj) => {
                const progress = calculateProgress(obj);
                return (
                    <div key={obj.id} className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
                        {/* Objective Header */}
                        <div className="p-4 flex items-center gap-3 bg-muted/30">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(obj.id)}>
                                {expanded[obj.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>

                            <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(obj.id)}>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 font-semibold">
                                        {obj.keyResults.length === 0 && (
                                            <Checkbox
                                                checked={obj.completed}
                                                onCheckedChange={() => toggleObjective(obj.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        )}
                                        <Target className="h-4 w-4 text-primary" />
                                        {obj.title}
                                        {obj.deadline && (
                                            <span className={cn("text-[10px] flex items-center gap-1 font-normal ml-2",
                                                new Date(obj.deadline) < new Date() && !obj.completed ? "text-red-500" : "text-muted-foreground"
                                            )}>
                                                <CalendarIcon className="h-3 w-3" />
                                                {format(new Date(obj.deadline), 'MMM d')}
                                            </span>
                                        )}
                                    </div>
                                    {/* Golden Circle Details Display */}
                                    {(obj.why || obj.how || obj.what) && (
                                        <div className="text-xs text-muted-foreground mt-1 ml-6 space-y-0.5">
                                            {obj.why && <div><span className="font-medium text-primary/70">Why:</span> {obj.why}</div>}
                                            {obj.how && <div><span className="font-medium text-primary/70">How:</span> {obj.how}</div>}
                                            {obj.what && <div><span className="font-medium text-primary/70">What:</span> {obj.what}</div>}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 w-full max-w-xs">
                                        <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground w-8">{progress}%</span>
                                    </div>
                                </div>
                            </div>

                            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setEditingGC({
                                id: obj.id,
                                type: 'objective',
                                title: obj.title,
                                data: { why: obj.why, how: obj.how, what: obj.what }
                            })}>
                                <HelpCircle className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditingItem({ id: obj.id, type: 'objective', initialData: { id: obj.id, title: obj.title, priority: 'medium' } })}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setCreateKRFor(obj.id)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Key Result
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteObjective(obj.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Key Results List */}
                        {
                            expanded[obj.id] && (
                                <div className="border-t divide-y">
                                    {obj.keyResults.length === 0 ? (
                                        <div className="p-2 text-center text-sm text-muted-foreground">
                                            No key results yet.
                                            <Button variant="link" onClick={() => setCreateKRFor(obj.id)}>Add one?</Button>
                                        </div>
                                    ) : (
                                        obj.keyResults.map((kr) => (
                                            <div key={kr.id}
                                                className={cn(
                                                    "p-3 pl-12 flex items-center gap-3 hover:bg-muted/50 transition-colors group",
                                                    kr.completed && "bg-muted/30"
                                                )}
                                            >
                                                <Checkbox checked={kr.completed} onCheckedChange={() => handleToggleKR(kr.id)} />

                                                <div className="flex-1">
                                                    <div className={cn("text-sm font-medium", kr.completed && "line-through text-muted-foreground")}>
                                                        {kr.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={kr.priority === 'high' ? 'destructive' : kr.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1">
                                                            {kr.priority}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 ml-2">
                                                            <div className="h-1.5 w-12 bg-secondary rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary transition-all duration-500"
                                                                    style={{ width: `${kr.completed ? 100 : 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground">{kr.completed ? '100%' : '0%'}</span>
                                                        </div>
                                                        {kr.deadline && (
                                                            <span className={cn("text-[10px] flex items-center gap-1",
                                                                new Date(kr.deadline) < new Date() && !kr.completed ? "text-red-500" : "text-muted-foreground"
                                                            )}>
                                                                <CalendarIcon className="h-3 w-3" />
                                                                {format(new Date(kr.deadline), 'MMM d')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Golden Circle Details Display for KR */}
                                                    {(kr.why || kr.how || kr.what) && (
                                                        <div className="text-[10px] text-muted-foreground mt-1 ml-1 space-y-0.5 w-full max-w-xl">
                                                            {kr.why && <div><span className="font-medium text-primary/70">Why:</span> {kr.why}</div>}
                                                            {kr.how && <div><span className="font-medium text-primary/70">How:</span> {kr.how}</div>}
                                                            {kr.what && <div><span className="font-medium text-primary/70">What:</span> {kr.what}</div>}
                                                        </div>
                                                    )}
                                                </div>

                                                <Button variant="ghost" size="icon" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditingGC({
                                                    id: kr.id,
                                                    type: 'key_result',
                                                    title: kr.title,
                                                    data: { why: kr.why, how: kr.how, what: kr.what }
                                                })}>
                                                    <HelpCircle className="h-4 w-4" />
                                                </Button>

                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditingItem({
                                                    id: kr.id,
                                                    type: 'key_result',
                                                    initialData: kr
                                                })}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>

                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteKR(kr.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                    <div className="p-2 pl-12">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={() => setCreateKRFor(obj.id)}>
                                            <Plus className="h-3 w-3 mr-1" /> Add Key Result
                                        </Button>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                );
            })}

            {createKRFor && (
                <CreateItemDialog
                    isOpen={true}
                    onClose={() => setCreateKRFor(null)}
                    type="key_result"
                    parentObjectiveId={createKRFor}
                />
            )}

            {editingItem && (
                <CreateItemDialog
                    isOpen={true}
                    onClose={() => setEditingItem(null)}
                    type={editingItem.type}
                    initialData={editingItem.initialData}
                    mode="edit"
                    parentObjectiveId={editingItem.type === 'key_result' ? editingItem.initialData.objectiveId : undefined}
                />
            )}

            {
                editingGC && (
                    <GoldenCircleDialog
                        isOpen={true}
                        onClose={() => setEditingGC(null)}
                        title={editingGC.title}
                        initialData={editingGC.data}
                        onSave={handleSaveGC}
                    />
                )
            }
        </div >
    );
}
