import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Film, Lock, Mail, Loader2, User, ChevronRight, Check } from "lucide-react";
import { motion } from "motion/react";

interface RegisterProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

const AVAILABLE_GENRES = [
  { id: "aksi", label: "Aksi (Action)" },
  { id: "komedi", label: "Komedi (Comedy)" },
  { id: "drama", label: "Drama" },
  { id: "sci-fi", label: "Sains Fiksi (Sci-Fi)" },
  { id: "horor", label: "Horor (Horror)" },
  { id: "romantis", label: "Romantis (Romance)" },
];

export default function Register({ onNavigateToLogin, onRegisterSuccess }: RegisterProps) {
  const [step, setStep] = useState(1); // Step 1: Account, Step 2: Choose initial favorites
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleGenre = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!displayName.trim() || !email.trim() || !password.trim()) {
        setError("Silakan lengkapi semua kolom akun.");
        return;
      }
      if (password.length < 6) {
        setError("Password harus minimal 6 karakter.");
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      // 1. Create firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create user profile doc in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        favoriteGenres: selectedGenres,
        createdAt: new Date().toISOString(),
      });

      onRegisterSuccess();
    } catch (err: any) {
      console.error("Registration error:", err);
      let errMsg = "Pendaftaran gagal. Silakan coba lagi.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "Email ini sudah terdaftar.";
        setStep(1); // Go back to correct step
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Format email tidak valid.";
        setStep(1);
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = "Metode pendaftaran Email/Password belum diaktifkan di Firebase Console Anda. Silakan aktifkan di menu Authentication -> Sign-in method.";
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
        <div className="text-center mb-6">
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`h-1 rounded-full transition-all duration-300 ${step === 1 ? "w-8 bg-indigo-500" : "w-4 bg-white/10"}`} />
          <span className={`h-1 rounded-full transition-all duration-300 ${step === 2 ? "w-8 bg-indigo-500" : "w-4 bg-white/10"}`} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/10 border border-red-900/30 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

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
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#050505] border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-white placeholder-white/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6 uppercase text-xs tracking-wider"
              >
                <span>Lanjut Pilih Genre</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-xs text-white/60">
                  Pilih satu atau beberapa genre kesukaan Anda untuk mempersonalisasi rekomendasi tren.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_GENRES.map((g) => {
                  const isSelected = selectedGenres.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGenre(g.id)}
                      className={`p-3 rounded-lg border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-indigo-500/10 border-indigo-500/40 text-white"
                          : "bg-black border-white/5 text-white/50 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span>{g.label}</span>
                      {isSelected && (
                        <div className="bg-indigo-500 text-white p-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white font-semibold rounded-lg transition-all cursor-pointer uppercase text-xs tracking-wider"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Daftar & Masuk"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-xs text-white/50 mt-8 uppercase tracking-wide">
          Sudah punya akun?{" "}
          <button
            onClick={onNavigateToLogin}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
          >
            Masuk Sekarang
          </button>
        </p>
      </motion.div>
    </div>
  );
}
