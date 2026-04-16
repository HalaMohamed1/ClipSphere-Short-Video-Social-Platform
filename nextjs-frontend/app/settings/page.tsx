"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type Prefs = {
  inApp?: Record<string, boolean>;
  email?: Record<string, boolean>;
};

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await apiCall<{ user: { notificationPreferences?: Prefs } }>(
          "/users/me",
          { method: "GET" }
        );
        const np = data.user?.notificationPreferences || {};
        setPrefs({
          inApp: { ...(np as { inApp?: Record<string, boolean> }).inApp },
          email: { ...(np as { email?: Record<string, boolean> }).email },
        });
      } catch {
        /* ignore */
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-gray-400">Loading…</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">
        <Link href="/login?callbackUrl=/settings" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">
          Log in
        </Link>{" "}
        to manage settings.
      </div>
    );
  }

  const toggle = (channel: "inApp" | "email", key: string) => {
    setPrefs((p) => ({
      ...p,
      [channel]: {
        ...(p[channel] || {}),
        [key]: !(p[channel]?.[key] ?? false),
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await apiCall("/users/preferences", {
        method: "PATCH",
        body: JSON.stringify({ notificationPreferences: prefs }),
      });
      setMessage("Saved.");
    } catch {
      setMessage("Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const keys = ["followers", "comments", "likes", "tips"] as const;

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">Notification settings</h1>
      <form onSubmit={handleSave} className="space-y-6">
        {message && (
          <p className="text-sm text-gray-400">{message}</p>
        )}
        <div>
          <h2 className="text-white font-semibold mb-3">In-app</h2>
          <div className="space-y-2">
            {keys.map((k) => (
              <label key={`in-${k}`} className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800">
                <span className="text-gray-300 capitalize">{k}</span>
                <input
                  type="checkbox"
                  checked={prefs.inApp?.[k] ?? true}
                  onChange={() => toggle("inApp", k)}
                  className="accent-zinc-400"
                />
              </label>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-white font-semibold mb-3">Email</h2>
          <div className="space-y-2">
            {keys.map((k) => (
              <label key={`em-${k}`} className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800">
                <span className="text-gray-300 capitalize">{k}</span>
                <input
                  type="checkbox"
                  checked={prefs.email?.[k] ?? false}
                  onChange={() => toggle("email", k)}
                  className="accent-zinc-400"
                />
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-100 text-zinc-950 font-medium px-6 py-2 hover:bg-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
