'use client';

import { Objective } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VisionBoardProps {
    objectives: Objective[];
}

export function VisionBoard({ objectives }: VisionBoardProps) {
    const totalPoints = objectives.reduce((acc, obj) => {
        return acc + (obj.keyResults.length > 0 ? obj.keyResults.length : 1);
    }, 0);

    const completedPoints = objectives.reduce((acc, obj) => {
        if (obj.keyResults.length > 0) {
            return acc + obj.keyResults.filter(k => k.completed).length;
        } else {
            return acc + (obj.completed ? 1 : 0);
        }
    }, 0);

    const globalProgress = totalPoints === 0 ? 0 : Math.round((completedPoints / totalPoints) * 100);

    return (
        <div className="">

            {/* Global Progress */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row gap-2 justify-between items-center">
                    <CardTitle className="text-lg">Total Progress</CardTitle>
                    <div><p className="text-sm text-muted-foreground">{globalProgress}% Completed, {completedPoints}/{totalPoints} Goals Achieved</p></div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${globalProgress}%` }}
                        />
                    </div>
                    
                </CardContent>
            </Card>
        </div>
    );
}
