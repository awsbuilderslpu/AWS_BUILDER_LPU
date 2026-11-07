import { NextResponse } from "next/server";
import { importAwsBuilderArticleAction } from "@/lib/blogs/aws-builder-sync";

// List of initial / known published articles from AWS Builder Center
export const KNOWN_AWS_BUILDER_ARTICLES = [
  "https://builder.aws.com/content/3KqBCa1dG9fJbyuApw1dXPnvQTh/decider-vs-claude-haiku-55-why-200-ms-and-11-s-are-both-true-a-yesno-gate-benchmark-you-can-run",
];

export async function GET(request: Request) {
  // Optional auth secret verification for cron jobs
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && searchParams.get("secret") !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];
  for (const url of KNOWN_AWS_BUILDER_ARTICLES) {
    try {
      const res = await importAwsBuilderArticleAction(url);
      results.push({ url, res });
    } catch (err) {
      results.push({
        url,
        res: { ok: false, error: err instanceof Error ? err.message : String(err) },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    synced: results.filter((r) => r.res.ok).length,
    results,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const urls: string[] = Array.isArray(body?.urls)
      ? body.urls
      : typeof body?.url === "string"
      ? [body.url]
      : KNOWN_AWS_BUILDER_ARTICLES;

    const results = [];
    for (const url of urls) {
      const res = await importAwsBuilderArticleAction(url);
      results.push({ url, res });
    }

    return NextResponse.json({
      ok: true,
      synced: results.filter((r) => r.res.ok).length,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}

