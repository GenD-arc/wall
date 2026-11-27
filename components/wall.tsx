"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/types";
import { profile } from "@/lib/profile";
import { Box, ErrorBox } from "@/components/box";
import { Composer } from "@/components/composer";
import { WallPost } from "@/components/wall-post";

const FEED_LIMIT = 50;

// Newest first, no duplicates (our own insert also arrives via Realtime).
function merge(current: Post[], incoming: Post[]) {
  const byId = new Map(current.map((p) => [p.id, p]));
  for (const p of incoming) byId.set(p.id, p);
  return [...byId.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function Wall() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const addPost = useCallback((post: Post) => {
    setPosts((cur) => (cur.some((p) => p.id === post.id) ? cur : merge(cur, [post])));
    setFresh((cur) => new Set(cur).add(post.id));
  }, []);

  // Initial load: latest 50 posts.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(FEED_LIMIT)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setLoadError(error.message);
        else setPosts((cur) => merge(cur, (data ?? []) as Post[]));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Live feed: new posts appear without a refresh.
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const channel = client
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => addPost(payload.new as Post)
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [addPost]);

  // Keep "5 minutes ago" accurate.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!supabase) {
    return (
      <ErrorBox title="The wall isn't connected to Supabase yet">
        Add <b>NEXT_PUBLIC_SUPABASE_URL</b> and <b>NEXT_PUBLIC_SUPABASE_ANON_KEY</b> as environment
        variables (in Vercel: Settings, Environment Variables), then redeploy.
      </ErrorBox>
    );
  }

  const count = posts.length;

  return (
    <>
      <Composer onPosted={addPost} />

      <Box
        title="Wall"
        aside={loading ? null : `Displaying ${count} wall post${count === 1 ? "" : "s"}.`}
        className="mt-[14px]"
      >
        {loadError ? (
          <ErrorBox title="Wall posts couldn't be loaded">
            Check your connection and refresh the page. Details: {loadError}
          </ErrorBox>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-[8px] px-[8px] py-[16px] text-fb-gray" aria-live="polite">
            <span className="fb-spinner" aria-hidden />
            Loading wall posts…
          </div>
        ) : count === 0 && !loadError ? (
          <p className="px-[8px] py-[16px] text-fb-gray">
            No one has written on {profile.firstName}&rsquo;s Wall yet. Write something above.
          </p>
        ) : (
          <ul aria-live="polite">
            {posts.map((post) => (
              <WallPost key={post.id} post={post} now={now} fresh={fresh.has(post.id)} />
            ))}
          </ul>
        )}
      </Box>
    </>
  );
}
