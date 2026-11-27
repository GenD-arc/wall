import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_BYTES } from "@/lib/profile";

const MAX_SIDE = 1600;

export class PhotoError extends Error {}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export function looksLikeImage(file: File) {
  return file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name);
}

// Reads the photo fully, shrinks it to at most 1600px and re-encodes it as
// JPEG, so phone photos upload fast and reliably on mobile data.
// GIFs are left alone to keep their animation.
export async function preparePhoto(file: File): Promise<{ blob: Blob; type: string; ext: string }> {
  let original: Blob;
  try {
    original = new Blob([await file.arrayBuffer()], { type: file.type });
  } catch {
    throw new PhotoError(
      "This photo couldn't be read from your device. If it's stored in the cloud (like Google Photos), download it to your phone first."
    );
  }

  let result = { blob: original, type: file.type, ext: EXT[file.type] ?? "" };

  if (file.type !== "image/gif") {
    try {
      const bitmap = await createImageBitmap(original);
      const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fff"; // transparent PNGs get a white background
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(bitmap, 0, 0, w, h);
        const jpeg = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
        const keepOriginal = ACCEPTED_PHOTO_TYPES.includes(file.type) && original.size <= (jpeg?.size ?? Infinity);
        if (jpeg && !keepOriginal) result = { blob: jpeg, type: "image/jpeg", ext: "jpg" };
      }
      bitmap.close();
    } catch {
      // Couldn't decode in the browser; fall back to the original file.
    }
  }

  if (!ACCEPTED_PHOTO_TYPES.includes(result.type)) {
    throw new PhotoError("That photo format isn't supported. Choose a JPG, PNG, GIF or WebP photo.");
  }
  if (result.blob.size > MAX_PHOTO_BYTES) {
    throw new PhotoError("That photo is too large. Photos can be up to 5 MB.");
  }
  return result;
}

export function isNetworkError(message: string) {
  return /failed to fetch|networkerror|load failed|network request failed/i.test(message);
}
