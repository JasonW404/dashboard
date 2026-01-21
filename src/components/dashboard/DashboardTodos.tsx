"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Circle, CheckCircle, ArrowRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Objective, KeyResult } from "@/types";
import { toggleKeyResult } from "@/actions/okr";
import Link from "next/link";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";

interface DashboardTodosProps {
    initialObjectives: Objective[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardTodos({ initialObjectives }: DashboardTodosProps) {
    const { data: objectives, mutate } = useSWR<Objective[]>('/api/todos', fetcher, {
        fallbackData: initialObjectives, // Ensure initialObjectives is passed correctly
        refreshInterval: 10000,
        revalidateOnFocus: true,
    });

    // 1. Top 3 short-term (active Key Results), sorted by priority (high > medium > low)
    const allKeyResults = (objectives || []).flatMap(obj => obj.keyResults);
    const activeKRs = allKeyResults.filter(kr => !kr.completed);

    const priorityOrder = { high: 3, medium: 2, low: 1 };

    const topActiveKRs = [...activeKRs].sort((a, b) => {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, 3);

    // 2. All Long term (Objectives)
    // We display them below.

    const handleToggleKR = async (id: string) => {
        await toggleKeyResult(id);
        mutate();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="h-full hover:shadow-md transition-shadow duration-200 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>What's next?</CardTitle>
                    <Link href="/todos">
                        <Button variant="ghost" size="sm" className="gap-2 group">
                            Plan <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 overflow-y-auto">

                    {/* Short Term: Top KRs */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Priorities</h4>
                        {topActiveKRs.length > 0 ? (
                            topActiveKRs.map((kr) => (
                                <div
                                    key={kr.id}
                                    className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                                    onClick={() => handleToggleKR(kr.id)}
                                >
                                    <button className="text-muted-foreground group-hover:text-primary transition-colors relative">
                                        <Circle className="h-4 w-4" />
                                    </button>
                                    <div className="flex-1 min-w-0 flex flex-row gap-2">
                                        <Badge variant={kr.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] h-full px-2">
                                            {kr.priority}
                                        </Badge>
                                        <div className="text-sm font-medium truncate leading-tight">{kr.title}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground italic pl-2">No active key results.</div>
                        )}
                    </div>

                    {/* Long Term: Objectives */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In the future</h4>
                        {(objectives || []).length > 0 ? (
                            (objectives || []).map(obj => {
                                const total = obj.keyResults.length;
                                const completed = obj.keyResults.filter(k => k.completed).length;
                                const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

                                return (
                                    <div key={obj.id} className="p-2 border rounded-md">

                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">{obj.title}</span>
                                            </div>
                                            <div className="text-[10px] text-right text-muted-foreground">{progress}%</div>
                                        </div>

                                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-sm text-muted-foreground italic pl-2">No objectives set.</div>
                        )}
                    </div>

                </CardContent>
            </Card>
        </motion.div>
    );
}
