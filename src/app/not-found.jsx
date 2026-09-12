'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Animated Glows */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1.1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Main Content Card */}
      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Animated Badge / Icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400 backdrop-blur-md shadow-xl shadow-purple-900/20">
            <ShieldAlert size={48} className="animate-pulse" />
          </div>
        </motion.div>

        {/* 404 Heading & Text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="text-7xl font-black tracking-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-200 to-cyan-400">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Page Not Found 
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
            The resource you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#141720] border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all hover:bg-white/5"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-semibold transition-all hover:opacity-90 shadow-lg shadow-purple-600/30"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}