'use client';

import { KeyResult, Objective } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isBefore, isToday, isTomorrow, isThisWeek, startOfDay, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleKeyResult, toggleObjective } from '@/actions/okr';
import { Target } from 'lucide-react';

interface TimeBucketKanbanProps {
    objectives: Objective[];
}

type ExtendedKeyResult = KeyResult & {
    objectiveTitle: string;
    objectiveId: string;
    objectiveProgress: number;
    type: 'key_result';
};

type ExtendedObjective = {
    id: string;
    title: string;
    completed: boolean;
    priority: 'medium';
    deadline: null;
    objectiveTitle: string;
    objectiveId: string;
    objectiveProgress: number;
    type: 'objective';
    createdAt: Date | string;
    updatedAt: Date | string;
};

type BucketItem = ExtendedKeyResult | ExtendedObjective;

export function TimeBucketKanban({ objectives }: TimeBucketKanbanProps) {
    // Flatten KRs and attach parent Objective title and progress
    const allItems: BucketItem[] = objectives.flatMap((obj): BucketItem[] => {
        const total = obj.keyResults.length;
        const completedKRs = obj.keyResults.filter(k => k.completed).length;
        const objectiveProgress = total === 0 ? (obj.completed ? 100 : 0) : Math.round((completedKRs / total) * 100);

        if (total === 0) {
            return [{
                id: obj.id,
                title: obj.title,
                completed: obj.completed,
                priority: 'medium' as const,
                deadline: null,
                objectiveTitle: obj.title,
                objectiveId: obj.id,
                objectiveProgress,
                type: 'objective' as const,
                createdAt: obj.createdAt,
                updatedAt: obj.updatedAt
            }];
        }

        return obj.keyResults.map(kr => ({
            ...kr,
            objectiveTitle: obj.title,
            objectiveId: obj.id,
            objectiveProgress,
            type: 'key_result' as const
        }));
    }).filter((item: BucketItem) => !item.completed);
    const today = startOfDay(new Date());

    const buckets = {
        overdue: allItems.filter(item => item.deadline && isBefore(new Date(item.deadline), today)),
        upcoming: allItems.filter(item => item.deadline && (isToday(new Date(item.deadline)) || isTomorrow(new Date(item.deadline)))),
        thisWeek: allItems.filter(item => {
            if (!item.deadline) return false;
            const deadlineDate = new Date(item.deadline);
            return !isBefore(deadlineDate, today) &&
                !isToday(deadlineDate) &&
                !isTomorrow(deadlineDate) &&
                isThisWeek(deadlineDate);
        }),
        later: allItems.filter(item => {
            if (!item.deadline) return true;
            const deadlineDate = new Date(item.deadline);
            return !isBefore(deadlineDate, today) && !isThisWeek(deadlineDate);
        })
    };

    const BucketColumn = ({ title, items, colorClass }: { title: string, items: BucketItem[], colorClass: string }) => (
        <div className="flex flex-col gap-3 min-w-75 flex-1 max-h-full">
            <div className={cn("px-4 py-3 rounded-lg font-semibold text-sm flex justify-between items-center shadow-sm shrink-0", colorClass)}>
                <span>{title}</span>
                <Badge variant="secondary" className="bg-white/20 text-inherit hover:bg-white/30">{items.length}</Badge>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-2">
                {items.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
                        <CardContent className="px-4 py-3 space-y-3">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    checked={item.completed}
                                    onCheckedChange={() => item.type === 'key_result' ? toggleKeyResult(item.id) : toggleObjective(item.id)}
                                />
                                <div className="text-sm font-medium leading-none mt-1">{item.title}</div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-7">
                                <Target className="w-3.5 h-3.5" />
                                <span className="truncate max-w-45">{item.objectiveTitle}</span>
                            </div>

                            <div className="ml-7">
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden" title={`Objective Progress: ${item.objectiveProgress}%`}>
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${item.objectiveProgress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-7">
                                {item.type === 'key_result' && (
                                    <Badge variant="outline" className={cn("text-[10px] px-2 h-5",
                                        item.priority === 'high' ? 'text-red-600 border-red-200 bg-red-50' : ''
                                    )}>
                                        {item.priority}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <div className="overflow-x-auto overflow-y-hidden pb-4 w-full h-[calc(100vh-14rem)]">
            <div className="flex gap-6 w-full min-w-max px-1 h-full items-start">
                <BucketColumn title="Overdue" items={buckets.overdue} colorClass="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" />
                <BucketColumn title="Focus (48h)" items={buckets.upcoming} colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" />
                <BucketColumn title="This Week" items={buckets.thisWeek} colorClass="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" />
                <BucketColumn title="Backlog / Later" items={buckets.later} colorClass="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" />
            </div>
        </div>
    );
}
