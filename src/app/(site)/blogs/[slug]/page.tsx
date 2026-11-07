import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { getPublicBlog } from "@/lib/public/blogs.server";
import { publicObjectUrl } from "@/lib/storage/urls";
import { docToPlainText } from "@/lib/richtext";
import { BlogDetail } from "@/components/features/public/BlogDetail";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const blog = await getPublicBlog(slug);

  if (!blog) {
    return {
      title: "Article not found",
    };
  }

  const title = blog.meta_title ?? blog.title;
  const description =
    blog.meta_description ??
    blog.excerpt ??
    (blog.body ? docToPlainText(blog.body, 160) : undefined) ??
    undefined;

  return {
    title,
    ...(description ? { description } : {}),
    ...(blog.source_url ? { alternates: { canonical: blog.source_url } } : {}),
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  await connection();
  const { slug } = await params;
  const post = await getPublicBlog(slug);

  if (!post) {
    notFound();
  }

  const imageUrl = post.featured_image_path
    ? publicObjectUrl("blog-images", post.featured_image_path)
    : null;

  return <BlogDetail post={post} imageUrl={imageUrl} />;
}
