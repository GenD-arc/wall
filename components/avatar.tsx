import Image from "next/image";
import { profile } from "@/lib/profile";

// The owner's photo, or the 2008 gray silhouette for anyone else.
export function Avatar({ name, size = 50 }: { name: string; size?: number }) {
  if (name === profile.name) {
    return (
      <Image
        src={profile.photo}
        alt=""
        width={size}
        height={size}
        className="shrink-0 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="shrink-0 bg-[#f0f0f0]"
    >
      <circle cx="25" cy="19" r="9" fill="#c4c4c4" />
      <path d="M8 50c0-11 7.6-18 17-18s17 7 17 18z" fill="#c4c4c4" />
    </svg>
  );
}
