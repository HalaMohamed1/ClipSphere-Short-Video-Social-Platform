"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-gray-400">Loading…</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">
        <Link href="/login?callbackUrl=/upload" className="text-zinc-300 hover:text-white underline underline-offset-2">
          Log in
        </Link>{" "}
        to upload videos.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Choose a video file");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("video", file);
      fd.append("title", title || file.name);
      fd.append("description", description);

      const result = await apiCall<{ video: { _id: string } }>("/videos/upload", {
        method: "POST",
        body: fd,
      });

      router.push(`/video/${result.video._id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">Upload video</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Video file</label>
          <input
            type="file"
            accept="video/*"
            required
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-400 file:mr-4 file:rounded-md file:border file:border-zinc-700 file:bg-zinc-800 file:text-zinc-200 file:px-4 file:py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Defaults to filename"
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-4 py-2 text-white focus:ring-1 focus:ring-zinc-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-4 py-2 text-white focus:ring-1 focus:ring-zinc-600 outline-none resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-md bg-zinc-100 text-zinc-950 font-medium py-3 hover:bg-white disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>
    </div>
  );
}
