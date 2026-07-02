import React from "react";
import { Movie } from "../types";
import { Star, Award, TrendingUp, User, Bookmark, CheckCircle2, BookmarkCheck } from "lucide-react";
import { motion } from "motion/react";

interface MovieCardProps {
  key?: any;
  movie: Movie;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: (movieId: string) => void | Promise<void>;
  isWatched: boolean;
  onToggleWatched: (movieId: string) => void | Promise<void>;
}

export default function MovieCard({
  movie,
  index,
  isBookmarked,
  onToggleBookmark,
  isWatched,
  onToggleWatched
}: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col h-full relative group"
    >
      {/* Visual Rank Tag */}
      <div className="absolute top-4 left-4 z-20 bg-indigo-600/90 text-white font-mono text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded shadow-lg border border-indigo-400/20">
        Tren #{index + 1}
      </div>

      {/* Top Banner Accent */}
      <div className={`h-28 w-full bg-gradient-to-br ${movie.bannerColor || 'from-indigo-950/40 to-slate-950'} relative p-4 flex flex-col justify-end overflow-hidden border-b border-white/5`}>
        {/* Abstract design lines */}
        <div className="absolute inset-0 bg-[#050505]/40 backdrop-blur-[1px] z-0" />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 blur-xl -translate-y-8 translate-x-8" />
        
        {/* Dynamic score bubble */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
          <TrendingUp className="w-3 h-3 text-indigo-400" />
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Tren:</span>
          <span className="text-xs font-semibold text-indigo-400">{movie.popularityScore}%</span>
        </div>

        {/* Genres */}
        <div className="relative z-10 mt-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            {movie.genres.map((g, i) => (
              <span key={i} className="text-[9px] font-mono uppercase tracking-wider text-white/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded backdrop-blur-sm">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Movie Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-base text-white leading-tight hover:text-indigo-400 transition-colors tracking-tight">
              {movie.title}
            </h3>
            <span className="text-[11px] text-white/40 block mt-1 font-mono">{movie.year} &bull; Dir. {movie.director}</span>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/30" />
              <span className="text-sm font-semibold text-white">{movie.rating.toFixed(1)}</span>
            </div>
            <span className="text-[9px] text-white/30 font-mono">{movie.votesCount}</span>
          </div>
        </div>

        <p className="text-xs text-white/60 line-clamp-3 mb-4 leading-relaxed font-sans">
          {movie.synopsis}
        </p>

        {/* Dynamic global analytics matchmaking */}
        <div className="mt-auto pt-4 border-t border-white/5 bg-black/20 -mx-5 -mb-5 p-5 space-y-4">
          <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-indigo-400 uppercase tracking-[0.2em] font-semibold">
              <Award className="w-3 h-3" />
              <span>Analisis Rating Global</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed italic font-serif">
              &ldquo;{movie.trendReason}&rdquo;
            </p>
          </div>

          {/* Cast Members */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider mr-1">Cast:</span>
            {movie.cast.map((actor, idx) => (
              <span key={idx} className="text-[9px] font-mono bg-white/5 border border-white/5 text-white/60 px-2 py-0.5 rounded">
                {actor}
              </span>
            ))}
          </div>

          {/* User actions */}
          <div className="flex gap-2 pt-1 border-t border-white/5">
            <button
              onClick={() => onToggleBookmark(movie.id)}
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider ${
                isBookmarked
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                  : "bg-white/5 border-white/10 hover:border-indigo-500/40 text-white/60 hover:text-white"
              }`}
            >
              <Bookmark className={`w-3 h-3 ${isBookmarked ? "fill-current" : ""}`} />
              <span>{isBookmarked ? "Disimpan" : "Simpan"}</span>
            </button>

            <button
              onClick={() => onToggleWatched(movie.id)}
              className={`flex-1 py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider ${
                isWatched
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-white/5 border-white/10 hover:border-emerald-500/40 text-white/60 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{isWatched ? "Ditonton" : "Nonton"}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
