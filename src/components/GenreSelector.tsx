import React from "react";
import { Flame, Laugh, Heart, Cpu, Ghost, Eye, Sparkles, Smile } from "lucide-react";
import { motion } from "motion/react";

interface GenreOption {
  id: string;
  label: string;
  englishLabel: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const GENRE_OPTIONS: GenreOption[] = [
  {
    id: "aksi",
    label: "Aksi",
    englishLabel: "Action",
    description: "Pertarungan intens, ledakan besar, & ketegangan adrenalin tinggi.",
    icon: Flame,
    color: "from-red-500/20 to-red-900/10 hover:border-red-500 text-red-400"
  },
  {
    id: "komedi",
    label: "Komedi",
    englishLabel: "Comedy",
    description: "Humor jenaka, satir, & situasi absurd yang mengocok perut.",
    icon: Laugh,
    color: "from-amber-500/20 to-amber-900/10 hover:border-amber-500 text-amber-400"
  },
  {
    id: "drama",
    label: "Drama",
    englishLabel: "Drama",
    description: "Kisah emosional mendalam tentang hubungan manusia & kehidupan nyata.",
    icon: Heart, // We can reuse heart for Drama/Romance
    color: "from-emerald-500/20 to-emerald-900/10 hover:border-emerald-500 text-emerald-400"
  },
  {
    id: "sci-fi",
    label: "Sains Fiksi",
    englishLabel: "Sci-Fi",
    description: "Dunia futuristik, kecerdasan buatan, eksplorasi luar angkasa & waktu.",
    icon: Cpu,
    color: "from-blue-500/20 to-blue-900/10 hover:border-blue-500 text-blue-400"
  },
  {
    id: "horor",
    label: "Horor",
    englishLabel: "Horror",
    description: "Ketakutan psikologis, supranatural, & jumpscare yang menegangkan.",
    icon: Ghost,
    color: "from-purple-500/20 to-purple-900/10 hover:border-purple-500 text-purple-400"
  },
  {
    id: "romantis",
    label: "Romantis",
    englishLabel: "Romance",
    description: "Kisah cinta manis, penuh rintangan, & kehangatan hubungan asmara.",
    icon: Smile,
    color: "from-pink-500/20 to-pink-900/10 hover:border-pink-500 text-pink-400"
  }
];

interface GenreSelectorProps {
  selectedGenre: string;
  onSelectGenre: (genreId: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function GenreSelector({
  selectedGenre,
  onSelectGenre,
  onSubmit,
  loading
}: GenreSelectorProps) {
  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-bold mb-3 flex items-center justify-center md:justify-start gap-2">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>LANGKAH 1: TENTUKAN MOOD ANDA</span>
        </h2>
        <div className="text-3xl font-light text-white mb-2 tracking-tight">
          Pilih <span className="italic font-serif text-indigo-300">genre film kesukaan</span> Anda
        </div>
        <p className="text-xs text-white/50 max-w-xl">
          Sistem kami akan memindai tren global terkini dan mencocokkan jutaan data rating penonton dunia untuk menyajikan 5 tontonan teratas.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {GENRE_OPTIONS.map((genre) => {
          const IconComponent = genre.icon;
          const isSelected = selectedGenre === genre.id;

          return (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              key={genre.id}
              onClick={() => onSelectGenre(genre.id)}
              className={`px-6 py-3 rounded-full border transition-all text-sm font-medium flex items-center gap-2.5 cursor-pointer ${
                isSelected
                  ? "border-indigo-500 bg-indigo-500/20 text-indigo-400 font-semibold shadow-lg shadow-indigo-500/10"
                  : "border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white/80 hover:text-white"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{genre.label}</span>
              <span className="text-[9px] uppercase font-mono tracking-wider opacity-40">
                {genre.englishLabel}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-center md:justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={!selectedGenre || loading}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-900 disabled:text-white/20 disabled:border-white/5 disabled:opacity-50 text-white font-semibold text-sm rounded-full shadow-lg shadow-indigo-600/20 border border-indigo-500/30 transition-all flex items-center gap-2.5 cursor-pointer uppercase tracking-wider"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Menganalisis Jutaan Rating...</span>
            </>
          ) : (
            <>
              <span>Dapatkan 5 Rekomendasi Tren</span>
              <Sparkles className="w-4 h-4 fill-current" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
