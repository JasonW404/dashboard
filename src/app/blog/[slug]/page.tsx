import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPostBySlug } from "@/actions/posts";
import { marked } from 'marked';

// Correct type definition for Next.js 15 App Router dynamic parameters
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost({ params }: Props) {
  const resolvedParams = await params;
  const postData = await getPostBySlug(resolvedParams.slug);

  if (!postData) {
    notFound();
  }

  // Convert markdown to HTML (marked is synchronous by default unless configured otherwise)
  const htmlContent = await marked(postData.content);

  const post = {
    ...postData,
    date: postData.date,
    content: htmlContent
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/blog">
        <Button variant="ghost" className="pl-0 gap-2 hover:pl-2 transition-all">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Button>
      </Link>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <time>{format(new Date(post.date), "MMMM do, yyyy")}</time>
          <div className="flex gap-2">
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div 
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}
