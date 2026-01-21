'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as React from 'react'; // Add React import
// Removed import { createObjective, createKeyResult } from '@/actions/okr'; to avoid unused import warnings if we dynamic import inside handle Submit

interface CreateItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'objective' | 'key_result';
    parentObjectiveId?: string; // Required if type is key_result
    initialData?: any;
    mode?: 'create' | 'edit';
}

export function CreateItemDialog({ isOpen, onClose, type, parentObjectiveId, initialData, mode = 'create' }: CreateItemDialogProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority || 'medium');
    const [deadline, setDeadline] = useState<Date | undefined>(initialData?.deadline ? new Date(initialData.deadline) : undefined);
    const [loading, setLoading] = useState(false);

    // Reset form when dialog opens/closes or initialData changes
    React.useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || '');
            setPriority(initialData?.priority || 'medium');
            setDeadline(initialData?.deadline ? new Date(initialData.deadline) : undefined);
        }
    }, [isOpen, initialData]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            if (mode === 'edit') {
                const { updateObjective, updateKeyResult } = await import('@/actions/okr');
                if (type === 'objective') {
                    await updateObjective(initialData.id, { title, deadline });
                } else {
                    await updateKeyResult(initialData.id, { title, priority, deadline });
                }
            } else {
                const { createObjective, createKeyResult } = await import('@/actions/okr');
                if (type === 'objective') {
                    await createObjective(title, deadline);
                } else {
                    if (!parentObjectiveId) throw new Error('Parent Objective ID is required for Key Results');
                    await createKeyResult(parentObjectiveId, title, priority, deadline);
                }
            }
            onClose();
            if (mode === 'create') {
                setTitle('');
                setPriority('medium');
                setDeadline(undefined);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'edit' ? 'Edit ' : 'New '}
                        {type === 'objective' ? 'North Star (Objective)' : 'Key Result'}
                    </DialogTitle>
                    <DialogDescription>
                        {type === 'objective'
                            ? 'Set a high-level, ambitious goal.'
                            : 'Add a measurable, time-bound action item.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder={type === 'objective' ? "e.g., Become a Market Leader" : "e.g., Ship feature X by Friday"}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {(type === 'key_result' || type === 'objective') && ( // Show deadline for both
                        <>
                            {type === 'key_result' && (
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Deadline (Optional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !deadline && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={deadline}
                                            onSelect={setDeadline}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading || !title.trim()}>
                            {loading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
