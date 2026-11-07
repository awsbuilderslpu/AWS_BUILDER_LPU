import { Suspense } from "react";
import { connection } from "next/server";
import { BlogsSection } from "@/components/features/blogs/BlogsSection";
import { listPublicBlogs } from "@/lib/public/blogs.server";
import { toBlogPost, popularTopicCounts } from "@/lib/public/blog-cards";
import { publicObjectUrl } from "@/lib/storage/urls";
import type { BlogPost } from "@/data/blogs";
import BlogsLoading from "./loading";

interface BlogsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function BlogsContent({ searchParams }: BlogsPageProps) {
  await connection();
  const resolvedParams = await searchParams;
  const rawTopic =
    typeof resolvedParams.topic === "string" ? resolvedParams.topic : undefined;

  const nowIso = new Date().toISOString();
  const rows = await listPublicBlogs(nowIso);
  const posts: BlogPost[] = rows
    .map((row) =>
      toBlogPost(
        row,
        Date.parse(nowIso),
        row.featured_image_path
          ? publicObjectUrl("blog-images", row.featured_image_path)
          : null
      )
    )
    .filter((p): p is BlogPost => p !== null);

  const topicCounts = popularTopicCounts(posts);

  return (
    <BlogsSection
      posts={posts}
      topicCounts={topicCounts}
      initialTopic={rawTopic}
    />
  );
}

export default function BlogsPage({ searchParams }: BlogsPageProps) {
  return (
    <Suspense fallback={<BlogsLoading />}>
      <BlogsContent searchParams={searchParams} />
    </Suspense>
  );
}
