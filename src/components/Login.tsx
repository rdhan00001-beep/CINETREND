import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithEmailAndPassword as firebaseSignIn } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Film, Lock, Mail, Loader2, Play } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
}

export default function Login({ onNavigateToRegister, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      let errMsg = "Email atau password salah.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = "Email atau password salah, atau akun Anda belum terdaftar di Firebase Console.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Format email tidak valid.";
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = "Metode masuk Email/Password belum diaktifkan di Firebase Console Anda. Silakan aktifkan di menu Authentication -> Sign-in method.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#e0e0e0] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-xl p-8 backdrop-blur-xl shadow-2xl relative z-10"
      >
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400 mb-3">
            <Film className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-white uppercase">
            CINE<span className="text-indigo-500">TREND</span>
          </h1>
          <p className="text-[9px] text-white/40 mt-2 font-mono uppercase tracking-[0.25em]">
            SISTEM REKOMENDASI FILM BERBASIS TREN
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/10 border border-red-900/30 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-white/20 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-white/20 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6 uppercase text-xs tracking-wider"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Masuk ke Akun"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-white/50 mt-8 uppercase tracking-wide">
          Belum punya akun?{" "}
          <button
            onClick={onNavigateToRegister}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
          >
            Daftar Sekarang
          </button>
        </p>
      </motion.div>
    </div>
  );
}
