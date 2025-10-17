"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
    };
  };
  timestamp: string;
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

  // Jika sudah login, langsung redirect
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.replace("/analyst-workspace");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:3002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message || "Login gagal");

      // Simpan token & user
      localStorage.setItem("accessToken", data.data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      setMessage({
        type: "success",
        text: "Login berhasil! Mengalihkan ke workspace...",
      });

      // Redirect setelah delay kecil
      setTimeout(() => router.replace("/analyst-workspace"), 800);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Login gagal" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8"
      >
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
            ASISGO CORE-SOVEREIGN
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
            {isLoading ? "Signing in..." : "Masuk ke Workspace"}
          </button>

          {/* Quick Login */}
          {/* <div className="text-center text-sm text-gray-600">
            Quick Login:
            <div className="flex justify-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setUsername("admin");
                  setPassword("admin123");
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername("analyst");
                  setPassword("admin123");
                }}
                className="px-3 py-1 bg-purple-600 text-white rounded-md text-xs hover:bg-purple-700"
              >
                Analyst
              </button>
            </div>
          </div> */}
        </form>
      </motion.div>
    </div>
  );
}
