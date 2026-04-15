"use client";

/**
 * Root-level error UI. Must be a Client Component and include <html> / <body>
 * (Next.js App Router). Helps avoid Turbopack/RSC manifest issues with the built-in default.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#050505",
          color: "#e5e7eb",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h1 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: 20 }}>
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(to right, #9333ea, #e11d48)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
