"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiCall } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

interface TxUser {
  _id: string;
  username?: string;
  avatarKey?: string;
}

interface LedgerTx {
  _id: string;
  amount: number;
  status: string;
  
  stripePaymentId?: string;
  sender?: TxUser;
  recipient?: TxUser;
  createdAt: string;
}

interface Summary {
  walletBalanceCents: number;
  pendingTipsCents: number;
  pendingTransactionCount: number;
}

export default function CreatorWalletPage() {
  const { user, loading: authLoading } = useAuth();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<LedgerTx[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stripeReturnBanner, setStripeReturnBanner] = useState<
    null | 'confirming' | { tone: 'ok'; text: string } | { tone: 'err'; text: string }
  >(null);
  const syncRanRef = useRef(false);
  
  const [finalizeBusySessionId, setFinalizeBusySessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("session_id")) {
      setStripeReturnBanner("confirming");
    }
  }, []);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const [sum, list] = await Promise.all([
        apiCall<Summary>("/payments/me/summary", { method: "GET" }),
        apiCall<{
          transactions: LedgerTx[];
          pagination: { total: number; page: number; pages: number };
        }>(`/payments/me/transactions?page=${p}&limit=15&role=all`, {
          method: "GET",
        }),
      ]);
      setSummary(sum);
      setTransactions(list.transactions || []);
      setPagination({
        total: list.pagination?.total ?? 0,
        page: list.pagination?.page ?? p,
        pages: list.pagination?.pages ?? 1,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  const finalizeCheckoutSession = useCallback(
    async (checkoutSessionId: string) => {
      setFinalizeBusySessionId(checkoutSessionId);
      setError(null);
      try {
        const data = await apiCall<{ finalized?: boolean; message?: string }>(
          "/payments/sync-checkout-session",
          {
            method: "POST",
            body: JSON.stringify({ sessionId: checkoutSessionId }),
          }
        );
        const msg =
          data?.finalized === false && data?.message
            ? data.message
            : "Tip synced — totals below should refresh.";
        setStripeReturnBanner({ tone: "ok", text: msg });
        await load(page);
      } catch (e) {
        setStripeReturnBanner({
          tone: "err",
          text:
            e instanceof Error
              ? `${e.message} If you never finished paying in Stripe, open the Checkout link again.`
              : "Could not finalize. Check Stripe keys and NEXT_PUBLIC_API_URL.",
        });
        await load(page);
      } finally {
        setFinalizeBusySessionId(null);
      }
    },
    [load, page]
  );

  useEffect(() => {
    if (!authLoading && user) {
      void load(page);
    }
  }, [user, authLoading, page, load]);

  useEffect(() => {
    if (authLoading || !user) return;
    const sid =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("session_id")
        : null;
    if (!sid || syncRanRef.current) return;
    syncRanRef.current = true;

    void (async () => {
      try {
        const data = await apiCall<{ finalized?: boolean; message?: string }>(
          "/payments/sync-checkout-session",
          {
            method: "POST",
            body: JSON.stringify({ sessionId: sid }),
          }
        );
        const msg =
          data?.finalized === false && data?.message
            ? data.message
            : "Tip finalized — totals below should refresh.";
        setStripeReturnBanner({ tone: "ok", text: msg });
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/creator/wallet");
        }
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Could not confirm payment with Stripe. Check NEXT_PUBLIC_API_URL / API logs.";
        setStripeReturnBanner({
          tone: "err",
          text: `${msg} Tip: run stripe listen forwarded to your API port and copy STRIPE_WEBHOOK_SECRET from the CLI (whsec_…).`,
        });
        syncRanRef.current = false;
      } finally {
        await load(page);
      }
    })();
  }, [authLoading, user, page, load]);

  if (authLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-zinc-400">
        {!authLoading && !user ? (
          <>
            <p>Sign in to view your wallet.</p>
            <Link href="/login" className="text-zinc-200 underline mt-2 inline-block">
              Log in
            </Link>
          </>
        ) : (
          <div className="h-8 w-48 bg-zinc-900 rounded animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Tips & wallet</h1>
        <p className="text-sm text-zinc-500">
          Tips use Stripe test mode. Returning from Stripe with <code className="text-zinc-400">?session_id=</code>{" "}
          runs a one-time sync. If balances stay at $0, use <strong>Finalize</strong> on a pending row (paid in
          Checkout but no webhook yet), or verify <code className="text-zinc-400">stripe listen</code> forwards to your
          API port and <code className="text-zinc-400">STRIPE_WEBHOOK_SECRET</code> matches the CLI{" "}
          <code className="text-zinc-400">whsec_…</code> value.
        </p>
      </div>

      {stripeReturnBanner === "confirming" && (
        <div className="rounded-lg border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/90">
          Confirming payment with Stripe… This calls your server to mark the tip complete (not only a
          webhook).
        </div>
      )}

      {stripeReturnBanner && typeof stripeReturnBanner === "object" && stripeReturnBanner.tone === "ok" && (
        <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200/90">
          {stripeReturnBanner.text}
        </div>
      )}

      {stripeReturnBanner && typeof stripeReturnBanner === "object" && stripeReturnBanner.tone === "err" && (
        <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200/90">
          {stripeReturnBanner.text}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Available</p>
          <p className="text-xl font-semibold text-zinc-100">
            {summary != null ? formatUsd(summary.walletBalanceCents) : loading ? "…" : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Pending tips</p>
          <p className="text-xl font-semibold text-amber-200/90">
            {summary != null ? formatUsd(summary.pendingTipsCents) : loading ? "…" : "—"}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {summary?.pendingTransactionCount ?? 0} in flight
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 sm:col-span-1 flex items-center">
          <Link
            href="/"
            className="text-sm text-zinc-300 hover:text-white underline underline-offset-2"
          >
            Back to feed
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-zinc-200 mb-1">Transaction history</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Stuck <span className="text-amber-500/90">pending</span> after you completed payment? Press{" "}
          <strong>Finalize</strong> — it uses the Checkout session id stored on that row (same as the redirect
          sync).
        </p>
        {loading && transactions.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-zinc-900/80 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-zinc-500 text-sm">No tips yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => {
              const incoming = user && tx.recipient && String(tx.recipient._id) === String(user._id);
              const peer = incoming ? tx.sender : tx.recipient;
              const isParty =
                !!user &&
                ((tx.sender && String(tx.sender._id) === String(user._id)) ||
                  (tx.recipient && String(tx.recipient._id) === String(user._id)));
              const sid = tx.stripePaymentId;
              const canFinalize =
                isParty &&
                tx.status === "pending" &&
                typeof sid === "string" &&
                sid.startsWith("cs_");
              return (
                <li
                  key={tx._id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 text-sm overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div>
                      <span className="text-zinc-400">
                        {incoming ? "From" : "To"}{" "}
                        <span className="text-zinc-200 font-medium">
                          {peer?.username ?? "Unknown"}
                        </span>
                      </span>
                      <span className="text-zinc-600 mx-2">·</span>
                      <time className="text-zinc-500" dateTime={tx.createdAt}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          tx.status === "completed"
                            ? "text-emerald-400/90"
                            : tx.status === "pending"
                              ? "text-amber-400/90"
                              : "text-zinc-400"
                        }
                      >
                        {tx.status}
                      </span>
                      <span className="font-semibold text-zinc-100">{formatUsd(tx.amount)}</span>
                    </div>
                  </div>
                  {canFinalize && sid && (
                    <div className="border-t border-zinc-800/80 px-4 py-3 bg-black/20">
                      <button
                        type="button"
                        disabled={finalizeBusySessionId === sid || loading}
                        onClick={() => void finalizeCheckoutSession(sid)}
                        className="w-full sm:w-auto rounded-md border border-amber-800/60 bg-amber-950/40 px-3 py-2 text-xs font-medium text-amber-100 hover:bg-amber-950/60 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {finalizeBusySessionId === sid ? "Finalizing…" : "Finalize (I paid in Stripe)"}
                      </button>
                      <p className="text-[11px] text-zinc-500 mt-2">
                        Use this if you left Checkout successfully but the balance did not update (e.g. webhook not
                        received).
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-md border border-zinc-700 text-sm text-zinc-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-500 py-1.5">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.pages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-md border border-zinc-700 text-sm text-zinc-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
