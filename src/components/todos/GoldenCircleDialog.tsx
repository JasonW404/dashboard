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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GoldenCircleData {
    why?: string | null;
    how?: string | null;
    what?: string | null;
}

interface GoldenCircleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    initialData: GoldenCircleData;
    onSave: (data: GoldenCircleData) => Promise<void>;
}

export function GoldenCircleDialog({
    isOpen,
    onClose,
    title,
    initialData,
    onSave,
}: GoldenCircleDialogProps) {
    const [data, setData] = useState<GoldenCircleData>({
        why: initialData.why || '',
        how: initialData.how || '',
        what: initialData.what || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(data);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Golden Circle: {title}</DialogTitle>
                    <DialogDescription>
                        Start with Why. Clarify your purpose (Why), process (How), and result (What).
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="why" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="why" className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-600">
                            WHY (Purpose)
                        </TabsTrigger>
                        <TabsTrigger value="how" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600">
                            HOW (Process)
                        </TabsTrigger>
                        <TabsTrigger value="what" className="data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600">
                            WHAT (Result)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="why" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Why does this matter? What is the belief behind it?</Label>
                            <Textarea
                                placeholder="The driving force, the cause, the belief..."
                                className="min-h-37.5"
                                value={data.why || ''}
                                onChange={(e) => setData({ ...data, why: e.target.value })}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="how" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>How will you achieve this? What are the specific actions?</Label>
                            <Textarea
                                placeholder="The specific actions taken to realize the Why..."
                                className="min-h-37.5"
                                value={data.how || ''}
                                onChange={(e) => setData({ ...data, how: e.target.value })}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="what" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>What is the tangible result? What do you do?</Label>
                            <Textarea
                                placeholder="The tangible proof of the Why..."
                                className="min-h-37.5"
                                value={data.what || ''}
                                onChange={(e) => setData({ ...data, what: e.target.value })}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Definition'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
