"use client";

import { useState } from "react";
import { apiUrl } from "../../lib/apiBase";

export default function UploadPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const onMultipartSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setUploadedUrl(null);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("No token in localStorage. Log in and store your JWT as token.");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/v1/upload/video"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : res.statusText || "Upload failed"
        );
        return;
      }
      const url =
        data.data && typeof data.data === "object" && "url" in data.data
          ? String((data.data as { url?: unknown }).url ?? "")
          : "";
      setUploadedUrl(url || null);
      setMessage(
        typeof data.message === "string"
          ? data.message
          : "Upload successful"
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const onPresignUpload = async () => {
    setMessage(null);
    setUploadedUrl(null);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("No token in localStorage. Log in and store your JWT as token.");
      return;
    }
    const input = document.getElementById("presign-file") as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setLoading(true);
    try {
      const presignRes = await fetch(apiUrl("/api/v1/upload/presign"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType: file.type || "application/octet-stream",
          filename: file.name,
          kind: "video",
        }),
      });
      const presignData = await presignRes.json().catch(() => ({}));
      if (!presignRes.ok) {
        setError(
          typeof presignData.message === "string"
            ? presignData.message
            : "Presign failed"
        );
        return;
      }
      const uploadUrl = presignData.data?.uploadUrl as string | undefined;
      const headers = presignData.data?.headers as Record<string, string> | undefined;
      if (!uploadUrl) {
        setError("Presign response missing uploadUrl.");
        return;
      }
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          ...(headers || {}),
        },
      });
      if (!putRes.ok) {
        setError(`Direct upload failed (${putRes.status})`);
        return;
      }
      const key = presignData.data?.key as string | undefined;
      const bucket = presignData.data?.bucket as string | undefined;
      setMessage(
        key && bucket
          ? `Presigned upload completed (${bucket}/${key}). Open MinIO Console → ${bucket} to preview or download.`
          : "Presigned upload completed."
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Upload video</h1>

      <p className="text-sm text-white/60 mb-6">
        Server enforces file type and size. This page does not validate files in the browser.
      </p>

      <form onSubmit={onMultipartSubmit} className="space-y-4 mb-10">
        <div>
          <label className="block text-sm text-white/80 mb-2">Multipart (Multer → API)</label>
          <input type="file" name="file" className="block w-full text-sm text-white/90" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-white/10 hover:bg-white/15 px-5 py-2 text-sm font-medium text-white border border-white/10 disabled:opacity-50"
        >
          {loading ? "Working…" : "Upload via server"}
        </button>
      </form>

      <div className="space-y-4 border-t border-white/10 pt-8">
        <label className="block text-sm text-white/80 mb-2">Presigned PUT (browser → MinIO)</label>
        <input id="presign-file" type="file" className="block w-full text-sm text-white/90" />
        <button
          type="button"
          onClick={onPresignUpload}
          disabled={loading}
          className="rounded-full bg-purple-600/80 hover:bg-purple-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Working…" : "Upload via presign"}
        </button>
      </div>

      {message && (
        <div className="mt-6 space-y-2" role="status">
          <p className="text-sm text-emerald-400">{message}</p>
          {uploadedUrl ? (
            <p className="text-sm text-white/80 break-all">
              Public URL:{" "}
              <a
                href={uploadedUrl}
                className="text-sky-400 underline hover:text-sky-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                {uploadedUrl}
              </a>
            </p>
          ) : null}
        </div>
      )}
      {error && (
        <p className="mt-6 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
