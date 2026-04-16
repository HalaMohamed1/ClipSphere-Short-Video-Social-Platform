"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { apiCall } from "../../lib/api";

interface AdminStats {
  totalUsers: number;
  totalVideos: number;
  systemHealth: {
    uptime: number;
    memoryUsage: number;
    cpuUsage?: number;
    databaseStatus: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Check authorization
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch admin statistics
  useEffect(() => {
    if (user?.role === "admin") {
      const fetchStats = async () => {
        try {
          const data = await apiCall("/admin/statistics", { method: "GET" });
          console.log("[v0] Admin stats data:", data);
          setStats(data);
        } catch (error) {
          console.error("Error fetching admin stats:", error);
          setError("Failed to load statistics");
        } finally {
          setIsLoading(false);
        }
      };

      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-400">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getHealthStatus = (status: string) => {
    const isHealthy = status.toLowerCase() === "healthy" || status.toLowerCase() === "connected";
    return {
      bg: isHealthy ? "bg-green-500/20" : "bg-red-500/20",
      border: isHealthy ? "border-green-500/50" : "border-red-500/50",
      text: isHealthy ? "text-green-400" : "text-red-400",
      icon: isHealthy ? "✓" : "✗",
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
          {user.username}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-400 font-semibold">Total Users</p>
            <svg
              className="w-6 h-6 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">
            {stats?.totalUsers.toLocaleString() || 0}
          </p>
          <p className="text-xs text-blue-300 mt-2">Registered accounts</p>
        </div>

        {/* Total Videos */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-400 font-semibold">Total Videos</p>
            <svg
              className="w-6 h-6 text-purple-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">
            {stats?.totalVideos.toLocaleString() || 0}
          </p>
          <p className="text-xs text-purple-300 mt-2">Uploaded content</p>
        </div>

        {/* System Uptime */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6 hover:border-green-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-400 font-semibold">System Uptime</p>
            <svg
              className="w-6 h-6 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats?.systemHealth?.uptime
              ? formatUptime(stats.systemHealth.uptime)
              : "N/A"}
          </p>
          <p className="text-xs text-green-300 mt-2">Time online</p>
        </div>

        {/* Memory Usage */}
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-400 font-semibold">Memory Usage</p>
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-white">
            {stats?.systemHealth?.memoryUsage
              ? `${Math.round(stats.systemHealth.memoryUsage)}%`
              : "N/A"}
          </p>
          <p className="text-xs text-yellow-300 mt-2">RAM usage</p>
        </div>
      </div>

      {/* Health Status */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">System Health</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Database Status</span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                getHealthStatus(stats?.systemHealth?.databaseStatus || "").bg
              } ${getHealthStatus(stats?.systemHealth?.databaseStatus || "").border} border ${
                getHealthStatus(stats?.systemHealth?.databaseStatus || "").text
              }`}
            >
              {getHealthStatus(stats?.systemHealth?.databaseStatus || "").icon}{" "}
              {stats?.systemHealth?.databaseStatus || "Unknown"}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 font-medium transition-colors">
            Manage Users
          </button>
          <button className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 font-medium transition-colors">
            View Logs
          </button>
          <button className="px-4 py-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-medium transition-colors">
            Manage Reports
          </button>
        </div>
      </div>
    </div>
  );
}
