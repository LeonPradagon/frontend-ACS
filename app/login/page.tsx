"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  
  // Auto refresh references
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Log environment info pada mount
  useEffect(() => {
    apiClient.logBaseUrl();
  }, []);

  // Clear semua intervals
  const clearAllIntervals = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const data = await apiClient.refreshToken(refreshToken);

      if (!data.success) {
        throw new Error(data.error || "Token refresh failed");
      }

      // Update access token
      const { accessToken, expiresAt, remainingTime } = data.data;
      localStorage.setItem("accessToken", accessToken);
      
      // Update expiry info
      if (expiresAt) {
        const expiryTime = new Date(expiresAt).getTime();
        setTokenExpiry(expiryTime);
      }
      
      if (remainingTime) {
        setRemainingTime(remainingTime);
      }

      console.log("🔄 Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      handleAutoLogout();
      return false;
    }
  };

  // Quick refresh token (optimized)
  const quickRefreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const data = await apiClient.quickRefresh(refreshToken);

      if (!data.success) {
        throw new Error(data.error || "Quick refresh failed");
      }

      const { accessToken, remainingTime } = data.data;
      localStorage.setItem("accessToken", accessToken);
      
      if (remainingTime) {
        setRemainingTime(remainingTime);
      }

      console.log("⚡ Quick token refresh - Remaining:", remainingTime, "s");
      return true;
    } catch (error) {
      console.error("❌ Quick refresh failed:", error);
      return false;
    }
  };

  // Verify token dan get info
  const verifyToken = async (): Promise<TokenInfo | null> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;

      const data = await apiClient.verifyToken();

      if (!data.success) {
        throw new Error("Token verification failed");
      }

      return data.data.tokenInfo;
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return null;
    }
  };

  // Setup auto refresh system
  const setupAutoRefresh = () => {
    clearAllIntervals();

    // Check token status setiap 30 detik
    tokenCheckIntervalRef.current = setInterval(async () => {
      const tokenInfo = await verifyToken();
      
      if (tokenInfo) {
        setRemainingTime(tokenInfo.remainingTime);
        
        // Jika token akan expired dalam 1 menit, refresh
        if (tokenInfo.remainingTime < 60 && tokenInfo.remainingTime > 0) {
          console.log("🔄 Token expiring soon, refreshing...");
          await quickRefreshToken();
        }
        
        // Jika token sudah expired, try refresh
        if (tokenInfo.remainingTime <= 0) {
          console.log("🔄 Token expired, attempting refresh...");
          await refreshToken();
        }
      }
    }, 30000); // Check every 30 seconds

    // Force refresh setiap 4 menit sebagai fallback
    refreshIntervalRef.current = setInterval(async () => {
      console.log("🔄 Scheduled token refresh");
      await quickRefreshToken();
    }, 4 * 60 * 1000); // 4 minutes
  };

  // Handle auto logout
  const handleAutoLogout = () => {
    clearAllIntervals();
    
    // Clear semua data auth
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    
    // Show logout message
    setMessage({
      type: "error",
      text: "Session expired. Please login again."
    });
    
    console.log("🔒 Auto logout due to token expiration");
    
    // Redirect to login
    router.replace("/");
  };

  // Effect untuk monitor token status
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setupAutoRefresh();
    }

    return () => {
      clearAllIntervals();
    };
  }, []);

  // Effect untuk update remaining time display
  useEffect(() => {
    if (remainingTime !== null && remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime(prev => prev !== null ? Math.max(0, prev - 1) : null);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [remainingTime]);

  // Jika sudah login, langsung redirect dan setup auto refresh
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      console.log("✅ User already logged in, setting up auto refresh...");
      setupAutoRefresh();
      router.replace("/analyst-workspace");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
  
    try {
      console.log("🔧 Attempting login with API URL:", process.env.NEXT_PUBLIC_API_URL);
      
      const data: LoginResponse = await apiClient.login({ username, password });
  
      if (!data.success)
        throw new Error(data.message || "Login gagal");
  
      // Simpan token & user dengan validation
      const { accessToken, refreshToken, expiresAt, remainingTime } = data.data.tokens;
      
      if (!accessToken || !accessToken.startsWith("eyJ")) {
        throw new Error("Token format invalid");
      }
  
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // Set expiry info
      if (expiresAt) {
        const expiryTime = new Date(expiresAt).getTime();
        setTokenExpiry(expiryTime);
      }
      
      if (remainingTime) {
        setRemainingTime(remainingTime);
      }
  
      // Verify storage
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken !== accessToken) {
        throw new Error("Failed to store token in localStorage");
      }
  
      console.log("✅ Login successful, token expires in:", remainingTime, "seconds");
  
      setMessage({
        type: "success",
        text: "Login berhasil! Mengalihkan ke workspace...",
      });

      // Setup auto refresh system
      setupAutoRefresh();
  
      // Redirect setelah delay kecil
      setTimeout(() => {
        router.replace("/analyst-workspace");
      }, 800);
    } catch (err: any) {
      // Clear any potentially corrupted tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      clearAllIntervals();
      
      console.error("❌ Login error:", err);
      setMessage({ 
        type: "error", 
        text: err.message || "Login gagal. Periksa koneksi atau credential Anda." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format waktu untuk display
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 relative"
      >
        {/* Token Expiry Indicator */}
        {remainingTime !== null && remainingTime > 0 && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className={`text-xs px-3 py-1 rounded-full border flex items-center gap-2 ${
              remainingTime > 60 
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-yellow-100 text-yellow-800 border-yellow-200"
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                remainingTime > 60 ? "bg-green-500" : "bg-yellow-500"
              }`}></div>
              <span>Token: {formatTime(remainingTime)}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            {process.env.NEXT_PUBLIC_APP_NAME || "ASISGO CORE-SOVEREIGN"}
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

          {/* Pesan status */}
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

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p className="mt-1">{process.env.NEXT_PUBLIC_APP_NAME || "ASISGO CORE-SOVEREIGN"}</p>
        </div>
      </motion.div>
    </div>
  );
}