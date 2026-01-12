import DashboardView from "@/components/dashboard/DashboardView";
import { getSortedPostsData } from "@/lib/blog/service";

export default function Home() {
  const posts = getSortedPostsData();
  return <DashboardView initialPosts={posts} />;
}
