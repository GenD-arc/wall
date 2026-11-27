"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/types";
import { MAX_CHARS, MAX_PICK_BYTES, PHOTO_BUCKET, profile } from "@/lib/profile";
import { isNetworkError, looksLikeImage, preparePhoto } from "@/lib/photo";
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
  const [status, setStatus] = useState("Sharing…");
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
    if (!looksLikeImage(f)) {
      setError({ title: "That file can't be posted", detail: "Choose a JPG, PNG, GIF or WebP photo." });
      return;
    }
    if (f.size > MAX_PICK_BYTES) {
      setError({ title: "That photo is too large", detail: "Choose a photo under 30 MB." });
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
      setStatus("Uploading photo…");
      try {
        imageUrl = await uploadPhoto(file);
      } catch (e) {
        setError({
          title: "Your photo didn't upload, so nothing was shared",
          detail: e instanceof Error ? e.message : String(e),
        });
        setSharing(false);
        return;
      }
    }

    setStatus("Sharing…");
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
            accept="image/*"
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
            {sharing ? status : "Share"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Uploads to Supabase Storage and returns the photo's public URL.
// Retries once if the connection drops mid-upload.
async function uploadPhoto(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase isn't connected.");
  const { blob, type, ext } = await preparePhoto(file);
  const path = `${crypto.randomUUID()}.${ext}`;
  const bucket = supabase.storage.from(PHOTO_BUCKET);

  for (let attempt = 1; attempt <= 2; attempt++) {
    const { error } = await bucket.upload(path, blob, {
      contentType: type,
      cacheControl: "31536000",
      upsert: false,
    });
    const msg = error?.message ?? "";
    // A retry can find the first attempt already landed.
    if (!error || (attempt > 1 && /exists|duplicate/i.test(msg))) {
      return bucket.getPublicUrl(path).data.publicUrl;
    }
    if (isNetworkError(msg) && attempt === 1) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    if (isNetworkError(msg)) {
      throw new Error(
        "The connection dropped while sending the photo. Check your signal and try again. If it keeps happening, turn off any ad or tracker blocker (or Data Saver) for this site."
      );
    }
    if (/bucket not found/i.test(msg)) {
      throw new Error(`The "${PHOTO_BUCKET}" storage bucket is missing. Run supabase/setup.sql in Supabase's SQL Editor.`);
    }
    if (/row-level security|unauthorized|403/i.test(msg)) {
      throw new Error("Supabase isn't allowing uploads yet. Run supabase/setup.sql again to add the upload policy.");
    }
    throw new Error(`Supabase said: ${msg}`);
  }
  throw new Error("The photo couldn't be uploaded. Try again.");
}
