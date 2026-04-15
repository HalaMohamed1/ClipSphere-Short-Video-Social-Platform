import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 text-center">
      <h1 className="text-3xl font-bold text-white mb-4">ClipSphere</h1>
      <p className="text-white/70 mb-8">
        Short video social platform. Use the upload page to test MinIO-backed uploads (JWT required).
      </p>
      <Link
        href="/upload"
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:opacity-95 transition-opacity"
      >
        Go to upload
      </Link>
    </div>
  );
}
