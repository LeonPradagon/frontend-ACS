"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { apiClient } from "@/lib/api";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
      name: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
      expiresAt?: string;
      remainingTime?: number;
    };
  };
  timestamp: string;
}

interface TokenInfo {
  expiresAt: string;
  remainingTime: number;
  isExpiringSoon: boolean;
  expiresIn: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auto refresh token states & refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Env
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "ASISGO CORE-SOVEREIGN";
  const appLogo = process.env.NEXT_PUBLIC_APP_LOGO || "/images/Asisgo.png";

  const TOKEN_EXPIRY_THRESHOLD = 60; // refresh jika sisa 1 menit
  const TOKEN_CHECK_INTERVAL = 30000; // check setiap 30 detik
  const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 menit

  // --- AUTO REFRESH SYSTEM (dari kode kamu) ---
  useEffect(() => {
    apiClient.logBaseUrl();
  }, []);

  const clearAllIntervals = () => {
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (tokenCheckIntervalRef.current)
      clearInterval(tokenCheckIntervalRef.current);
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");
      const data = await apiClient.refreshToken(refreshToken);
      if (!data.success) throw new Error("Token refresh failed");
      const { accessToken, expiresAt, remainingTime } = data.data;
      localStorage.setItem("accessToken", accessToken);
      if (expiresAt) setTokenExpiry(new Date(expiresAt).getTime());
      if (remainingTime) setRemainingTime(remainingTime);
      console.log("🔄 Token refreshed successfully");
      return true;
    } catch (err) {
      console.error("❌ Token refresh failed:", err);
      handleAutoLogout();
      return false;
    }
  };

  const quickRefreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");
      const data = await apiClient.quickRefresh(refreshToken);
      if (!data.success) throw new Error("Quick refresh failed");
      const { accessToken, remainingTime } = data.data;
      localStorage.setItem("accessToken", accessToken);
      if (remainingTime) setRemainingTime(remainingTime);
      console.log("⚡ Quick token refresh - Remaining:", remainingTime, "s");
      return true;
    } catch (err) {
      console.error("❌ Quick refresh failed:", err);
      return false;
    }
  };

  const verifyToken = async (): Promise<TokenInfo | null> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
      const data = await apiClient.verifyToken();
      if (!data.success) throw new Error("Token verification failed");
      return data.data.tokenInfo;
    } catch (err) {
      console.error("❌ Token verification failed:", err);
      return null;
    }
  };

  const setupAutoRefresh = () => {
    clearAllIntervals();
    tokenCheckIntervalRef.current = setInterval(async () => {
      const tokenInfo = await verifyToken();
      if (tokenInfo) {
        setRemainingTime(tokenInfo.remainingTime);
        if (
          tokenInfo.remainingTime < TOKEN_EXPIRY_THRESHOLD &&
          tokenInfo.remainingTime > 0
        ) {
          console.log("🔄 Token expiring soon, refreshing...");
          await quickRefreshToken();
        }
        if (tokenInfo.remainingTime <= 0) {
          console.log("🔄 Token expired, attempting refresh...");
          await refreshToken();
        }
      }
    }, TOKEN_CHECK_INTERVAL);

    refreshIntervalRef.current = setInterval(async () => {
      console.log("🔄 Scheduled token refresh (10 minutes)");
      await quickRefreshToken();
    }, TOKEN_REFRESH_INTERVAL);

    console.log(
      "✅ Auto refresh setup - Checking every 30s, refreshing every 10m"
    );
  };

  const handleAutoLogout = () => {
    clearAllIntervals();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setMessage({ type: "error", text: "Session expired. Please login again." });
    router.replace("/");
  };

  // --- LOGIN HANDLER ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const data: LoginResponse = await apiClient.login({ username, password });
      if (!data.success) throw new Error(data.message || "Login gagal");
      const { accessToken, refreshToken, expiresAt, remainingTime } =
        data.data.tokens;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      if (expiresAt) setTokenExpiry(new Date(expiresAt).getTime());
      if (remainingTime) setRemainingTime(remainingTime);
      setupAutoRefresh();
      setMessage({
        type: "success",
        text: "Login berhasil! Mengalihkan ke workspace...",
      });
      setTimeout(() => router.replace("/analyst-workspace"), 800);
    } catch (err: any) {
      clearAllIntervals();
      localStorage.clear();
      setMessage({
        type: "error",
        text:
          err.message || "Login gagal. Periksa koneksi atau credential Anda.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 relative"
      >
        {/* Token expiry indicator */}
        {remainingTime !== null && remainingTime > 0 && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div
              className={`text-xs px-3 py-1 rounded-full border flex items-center gap-2 ${
                remainingTime > 300
                  ? "bg-green-100 text-green-800 border-green-200"
                  : remainingTime > 60
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  remainingTime > 300
                    ? "bg-green-500"
                    : remainingTime > 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span>Token: {formatTime(remainingTime)}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <div className="h-16 w-16 relative rounded-full overflow-hidden shadow-md">
            <Image
              src={appLogo}
              alt={appName}
              fill
              className="object-contain p-1"
              sizes="64px"
              priority
            />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            {appName}
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to your Analyst Workspace
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 text-white font-medium rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p className="mt-1">{appName}</p>
        </div>
      </motion.div>
    </div>
  );
}
