"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/types";
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_CHARS,
  MAX_PHOTO_BYTES,
  PHOTO_BUCKET,
  profile,
} from "@/lib/profile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBox } from "@/components/box";

export function Composer({ onPosted }: { onPosted: (post: Post) => void }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<{ title: string; detail?: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const trimmed = text.trim();
  const remaining = MAX_CHARS - text.length;
  const canShare = !sharing && (trimmed.length > 0 || file !== null) && remaining >= 0;
  const expanded = focused || text.length > 0 || file !== null;

  // Show a thumbnail of the chosen photo; free the memory when it changes.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(f: File | undefined) {
    if (fileInput.current) fileInput.current.value = "";
    if (!f) return;
    if (!ACCEPTED_PHOTO_TYPES.includes(f.type)) {
      setError({ title: "That file type can't be posted", detail: "Choose a JPG, PNG, GIF or WebP photo." });
      return;
    }
    if (f.size > MAX_PHOTO_BYTES) {
      setError({ title: "That photo is too large", detail: "Photos can be up to 5 MB." });
      return;
    }
    setError(null);
    setFile(f);
  }

  async function share() {
    if (!supabase || !canShare) return;
    setSharing(true);
    setError(null);

    let imageUrl: string | null = null;
    if (file) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (uploadError) {
        setError({
          title: "Your photo didn't upload, so nothing was shared",
          detail: `Check that the "${PHOTO_BUCKET}" storage bucket exists (see supabase/setup.sql). Details: ${uploadError.message}`,
        });
        setSharing(false);
        return;
      }
      imageUrl = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({ author_name: profile.name, body: trimmed || null, image_url: imageUrl })
      .select()
      .single();

    if (insertError) {
      setError({ title: "Your post wasn't shared", detail: insertError.message });
    } else {
      onPosted(data as Post);
      setText("");
      setFile(null);
    }
    setSharing(false);
  }

  return (
    <div className="border border-[#ccc] bg-[#f7f7f7] p-[8px]">
      <label htmlFor="wall-input" className="sr-only">
        Write something on {profile.firstName}&rsquo;s Wall
      </label>
      <Textarea
        id="wall-input"
        value={text}
        maxLength={MAX_CHARS}
        placeholder="Write something..."
        disabled={sharing}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            share();
          }
        }}
        className={cn("transition-[height] duration-150", expanded ? "h-[72px]" : "h-[36px]")}
      />

      {preview && file ? (
        <div className="mt-[8px] flex items-start gap-[8px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Selected photo"
            className="h-[75px] w-[75px] border border-[#ccc] bg-white object-cover p-[2px]"
          />
          <div className="min-w-0 pt-[2px]">
            <p className="truncate text-[#333]">{file.name}</p>
            <Button variant="link" size="none" onClick={() => setFile(null)} disabled={sharing}>
              Remove photo
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <ErrorBox title={error.title}>{error.detail}</ErrorBox>
      ) : null}

      <div className="mt-[6px] flex flex-wrap items-center justify-between gap-[8px]">
        <div className="flex items-center gap-[10px] text-fb-gray">
          <span>Attach:</span>
          <Button
            variant="link"
            size="none"
            onClick={() => fileInput.current?.click()}
            disabled={sharing}
            className="gap-[4px]"
          >
            <svg aria-hidden width="16" height="12" viewBox="0 0 16 12" className="shrink-0">
              <rect x="0.5" y="2.5" width="15" height="9" rx="1" fill="#d8dfea" stroke="#3b5998" />
              <rect x="5" y="0.5" width="6" height="3" fill="#3b5998" />
              <circle cx="8" cy="7" r="2.6" fill="#fff" stroke="#3b5998" />
            </svg>
            Photo
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED_PHOTO_TYPES.join(",")}
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        <div className="flex items-center gap-[10px]">
          <span
            aria-live="polite"
            className={cn(remaining <= 20 ? "font-bold text-[#dd3c10]" : "text-fb-gray")}
          >
            {remaining} character{remaining === 1 ? "" : "s"} remaining
          </span>
          <Button onClick={share} disabled={!canShare} size="default" className="sm:text-[11px] text-[13px] px-[10px] py-[3px]">
            {sharing ? "Sharing…" : "Share"}
          </Button>
        </div>
      </div>
    </div>
  );
}
