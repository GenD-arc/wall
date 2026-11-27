import type { Post } from "@/lib/types";
import { fullTime, wallTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/avatar";

export function WallPost({ post, now, fresh }: { post: Post; now: number; fresh: boolean }) {
  return (
    <li className={cn("flex gap-[10px] border-t border-fb-line px-[8px] py-[10px]", fresh && "fb-new")}>
      <Avatar name={post.author_name} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-fb-blue">{post.author_name}</p>
        {post.body ? (
          <p className="mt-[2px] whitespace-pre-wrap break-words">{post.body}</p>
        ) : null}
        {post.image_url ? (
          <a href={post.image_url} target="_blank" rel="noreferrer" className="mt-[6px] inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt={post.body ? `Photo: ${post.body.slice(0, 80)}` : `Photo posted by ${post.author_name}`}
              loading="lazy"
              className="block max-h-[360px] max-w-full border border-[#ccc] bg-white p-[3px] sm:max-w-[320px]"
            />
          </a>
        ) : null}
        <p className="mt-[4px] text-fb-gray">
          <time dateTime={post.created_at} title={fullTime(post.created_at)}>
            {wallTime(post.created_at, now)}
          </time>
        </p>
      </div>
    </li>
  );
}
