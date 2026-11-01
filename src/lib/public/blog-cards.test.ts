import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  toBlogPost,
  topicsFor,
  popularTopicCounts,
} from "./blog-cards";
import type { BlogPost } from "../../data/blogs";

describe("blog-cards adapter", () => {
  const baseNow = Date.parse("2026-11-01T12:00:00Z");

  it("handles toBlogPost for a featured post", () => {
    const post = toBlogPost(
      {
        slug: "featured-deep-dive",
        title: "Featured Deep Dive",
        excerpt: "A deep dive into cloud services.",
        category: "AWS",
        tags: ["tutorials"],
        read_minutes: 7,
        author_name: "John Doe",
        publish_at: "2026-10-15T04:30:00Z",
        is_featured: true,
      },
      baseNow,
      "https://example.com/blog.png"
    );

    assert.ok(post);
    assert.equal(post.featured, true);
    assert.equal(post.date, "2026-10-15");
    assert.equal(post.href, "/blogs/featured-deep-dive");
    assert.equal(post.image, "https://example.com/blog.png");
    assert.deepEqual(post.topics, ["AWS", "Tutorials"]);
  });

  it("returns null when publish date is missing or invalid", () => {
    const nullDate = toBlogPost(
      {
        slug: "no-date",
        title: "No Date",
        category: "AWS",
        author_name: "Jane",
        publish_at: null,
      },
      baseNow,
      null
    );
    assert.equal(nullDate, null);

    const badDate = toBlogPost(
      {
        slug: "bad-date",
        title: "Bad Date",
        category: "AWS",
        author_name: "Jane",
        publish_at: "not-a-date",
      },
      baseNow,
      null
    );
    assert.equal(badDate, null);
  });

  it("extracts topics from category and tags including case-insensitive matching and non-topic categories", () => {
    // "Cloud Security" is not one of the six canonical topics
    const noTopics = topicsFor("Cloud Security", []);
    assert.deepEqual(noTopics, []);

    // Category is not a topic, but tag matches case-insensitively
    const withTag = topicsFor("Cloud Security", ["aws", "other-tag"]);
    assert.deepEqual(withTag, ["AWS"]);

    // Category is a topic, tags have case variations and duplicate
    const mixed = topicsFor("Tutorials", ["CLOUD COMPUTING", "aws", "tutorials", "career"]);
    // Should be in canonical order: AWS, Cloud Computing, Tutorials, Community, Career, Projects
    assert.deepEqual(mixed, ["AWS", "Cloud Computing", "Tutorials", "Career"]);
  });

  it("computes popularTopicCounts correctly across posts", () => {
    const posts: BlogPost[] = [
      {
        slug: "post-1",
        title: "Post 1",
        category: "AWS",
        topics: ["AWS", "Tutorials"],
        authorName: "Alice",
        date: "2026-10-01",
        readMinutes: 5,
        href: "/blogs/post-1",
      },
      {
        slug: "post-2",
        title: "Post 2",
        category: "Career",
        topics: ["Career", "Community"],
        authorName: "Bob",
        date: "2026-10-02",
        readMinutes: 3,
        href: "/blogs/post-2",
      },
      {
        slug: "post-3",
        title: "Post 3",
        category: "AWS",
        topics: ["AWS", "Projects"],
        authorName: "Charlie",
        date: "2026-10-03",
        readMinutes: 4,
        href: "/blogs/post-3",
      },
    ];

    const counts = popularTopicCounts(posts);
    assert.deepEqual(counts, {
      AWS: 2,
      "Cloud Computing": 0,
      Tutorials: 1,
      Community: 1,
      Career: 1,
      Projects: 1,
    });
  });
});

