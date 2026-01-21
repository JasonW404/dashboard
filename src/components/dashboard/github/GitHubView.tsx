"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, GitBranch, Star, GitFork, AlertCircle, ArrowRight } from "lucide-react";

import { useGitHubStats } from "@/hooks/useGitHubStats";
import { useDashboardStore } from "@/lib/store";
import { motion } from "framer-motion";
import { ActivityCalendar } from "react-activity-calendar";
import { DashboardSettings } from "@/types";
import { useEffect, useState } from "react";
import useSWR from 'swr';
import { useTheme } from "next-themes";

interface GitHubViewProps {
    initialSettings: DashboardSettings;
}

async function fetcher(url: string) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    return res.json();
}

export default function GitHubView({ initialSettings }: GitHubViewProps) {
    // Initialize store with server data
    const { updateSettings, settings: storeSettings } = useDashboardStore();

    // Use store data if available (client-side updates), otherwise fallback to initial server data
    const currentSettings = storeSettings.githubUsername ? storeSettings : initialSettings;

    useEffect(() => {
        // Hydrate store with server data
        if (initialSettings) {
            updateSettings(initialSettings);
        }
    }, [initialSettings, updateSettings]);

    const { userStats, repoStats, isLoading } = useGitHubStats(currentSettings);

    // Theme support
    const { resolvedTheme } = useTheme();

    // Fetch calendar data
    const { data: calendarData, isLoading: isLoadingCalendar } = useSWR(
        currentSettings.githubUsername ? `/api/github/calendar?username=${currentSettings.githubUsername}` : null,
        fetcher
    );

    // Fix hydration mismatch by only rendering after mount
    const [mounted, setMounted] = useState(false);

    const [blockSize, setBlockSize] = useState(12);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => {
            if (window.innerWidth < 500) {
                setBlockSize(6);
            } else if (window.innerWidth < 768) {
                setBlockSize(8);
            } else if (window.innerWidth < 1024) {
                setBlockSize(10);
            } else {
                setBlockSize(12);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalStars = repoStats?.reduce((acc, repo) => acc + repo.stars, 0) || 0;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Prevent hydration mismatch by returning a loading state or similar structure during SSR
    if (!mounted) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-muted rounded"></div>
                <div className="w-full h-50 bg-muted rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-muted rounded-lg"></div>
                    <div className="h-32 bg-muted rounded-lg"></div>
                    <div className="h-32 bg-muted rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (!currentSettings.githubUsername) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center space-y-4 py-12 text-center"
            >
                <div className="text-muted-foreground">GitHub username not configured</div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 w-full"
        >
            <h2 className="text-2xl font-bold">GitHub Overview</h2>
            <div className="github-calendar flex flex-col lg:flex-row gap-6">
                <motion.div variants={item} className="w-full">
                    <Card className="h-full hover:shadow-lg transition-shadow duration-200 flex flex-col py-4 px-2">
                        <CardContent className="flex-1 flex justify-center items-center overflow-hidden px-2">
                            <div className="w-full h-full flex items-center justify-center overflow-x-auto custom-scrollbar">
                                <div className="min-w-fit">
                                    {isLoadingCalendar ? (
                                        <div className="flex items-center justify-center h-32 w-full text-muted-foreground">
                                            Loading calendar...
                                        </div>
                                    ) : calendarData?.contributions ? (
                                        <ActivityCalendar
                                            data={calendarData.contributions}
                                            blockSize={blockSize}
                                            blockMargin={2}
                                            fontSize={12}
                                            theme={{
                                                light: [
                                                    '#ebedf0', // Empty
                                                    '#d4d4d8', // Level 1 - darkened from #e4e4e7
                                                    '#a1a1aa', // Level 2
                                                    '#52525b', // Level 3
                                                    '#18181b', // Level 4
                                                ],
                                                dark: [
                                                    '#161b22', // Empty
                                                    '#3f3f46', // Level 1
                                                    '#71717a', // Level 2
                                                    '#a1a1aa', // Level 3
                                                    '#e4e4e7', // Level 4
                                                ]
                                            }}
                                            labels={{
                                                legend: {
                                                    less: 'Less',
                                                    more: 'More',
                                                },
                                                months: [
                                                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                                                ],
                                                totalCount: '{{count}} contributions in the last year'
                                            }}
                                            colorScheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                                        />
                                    ) : (
                                        <div className="text-red-500">Failed to load contributions</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats Blocks - Single card vertical */}
                <motion.div variants={item} className="">
                    <Card className="h-full hover:shadow-lg transition-shadow duration-200 py-2">
                        <CardContent className="flex flex-row lg:flex-col sm:flex-row justify-center items-center lg:items-start sm:items-center h-full px-6 py-4 gap-2 sm:gap-2 lg:gap-4 text-center lg:text-right font-medium">
                            <div className="flex flex-col items-center lg:items-end w-full">
                                <div className="text-2xl font-bold leading-none">
                                    {isLoading ? "..." : totalStars}
                                </div>
                                <div className="text-sm">Stars</div>
                            </div>

                            <div className="flex flex-col items-center lg:items-end w-full">
                                <div className="text-2xl font-bold leading-none">
                                    {isLoading ? "..." : userStats?.repos}
                                </div>
                                <div className="text-sm">Repos</div>
                            </div>

                            <div className="flex flex-col items-center lg:items-end w-full">
                                <div className="text-2xl font-bold leading-none">
                                    {isLoadingCalendar ? "..." : calendarData?.total || userStats?.commits || 0}
                                </div>
                                <div className="text-sm">Contributions</div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div >

            {/* Tracked Repositories */}
            {
                repoStats && repoStats.length > 0 && (
                    <motion.div variants={item} className="space-y-4">
                        <div className="flex flex-col gap-4">
                            {repoStats?.map((repo) => (
                                <Card key={`${repo.owner}/${repo.name}`} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 w-full">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-medium">
                                            <a
                                                href={repo.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="hover:text-primary transition-colors flex items-center group"
                                            >
                                                {repo.owner}/{repo.name}
                                                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                            </a>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                {repo.stars}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <GitFork className="h-4 w-4" />
                                                {repo.forks}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {repo.openIssues}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>)
            }
        </motion.div >
    );
}
