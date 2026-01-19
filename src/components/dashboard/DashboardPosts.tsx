"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { BlogPost } from "@/types";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface DashboardPostsProps {
    initialPosts: BlogPost[];
}

export default function DashboardPosts({ initialPosts }: DashboardPostsProps) {
    const recentPosts = initialPosts.slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card className="h-full hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Latest Posts</CardTitle>
                    <Link href="/blog">
                        <Button variant="ghost" size="sm" className="gap-2 group">
                            Read Blog <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentPosts.length > 0 ? (
                            recentPosts.map((post) => (
                                <Link key={post.slug} href={`/blog/${post.slug}`}>
                                    <div className="group space-y-1 cursor-pointer hover:bg-muted/50 p-3 -mx-2 rounded-lg transition-colors border border-transparent hover:border-border">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium group-hover:text-primary transition-colors">
                                                {post.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(post.date), "MMM d")}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No posts yet.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
