import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "./lib/firebase";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import { Film, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ViewState = "loading" | "login" | "register" | "dashboard";

export default function App() {
  const [view, setView] = useState<ViewState>("loading");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Listen to Firebase authentication status
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setView("dashboard");
      } else {
        setUser((currentUser: any) => {
          if (currentUser && currentUser.isDemo) {
            return currentUser; // Persist the guest demo user
          }
          setView("login");
          return null;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen text-[#e0e0e0] font-sans select-none antialiased selection:bg-indigo-500/30 selection:text-white">
      <AnimatePresence mode="wait">
        {view === "loading" && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="p-3.5 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400 mb-4"
            >
              <Film className="w-8 h-8" />
            </motion.div>
            <h2 className="text-xl font-bold tracking-tighter text-white uppercase text-center">
              CINE<span className="text-indigo-500">TREND</span>
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono mt-2.5 uppercase tracking-[0.2em]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Memuat Server Rating...</span>
            </div>
          </motion.div>
        )}

        {view === "login" && (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Login
              onNavigateToRegister={() => setView("register")}
              onLoginSuccess={() => setView("dashboard")}
            />
          </motion.div>
        )}

        {view === "register" && (
          <motion.div
            key="register-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Register
              onNavigateToLogin={() => setView("login")}
              onRegisterSuccess={() => setView("dashboard")}
            />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard-screen"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Dashboard
              user={user}
              onLogout={() => {
                setUser(null);
                setView("login");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
