'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Ticket, CheckCircle2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useRouter, usePathname } from 'next/navigation';

export default function Herosection() {
  const router = useRouter();
  const pathname = usePathname();

  // Smooth Scroll to Discover Section
  const handleScrollToDiscover = (e) => {
    e.preventDefault();
    if (pathname !== '/') {
      router.push('/#discover');
    } else {
      const discoverElement = document.getElementById('discover');
      if (discoverElement) {
        discoverElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <main className="max-w-7xl w-full mx-auto px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

      {/* Left Column: Typography & CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:col-span-7 space-y-6 text-left"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Events, Simplified
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
          Create <br />
          experiences <br />
          people <br />
          remember.
        </h1>

        {/* Paragraph */}
        <p className="text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
          Create events, manage registrations, issue digital tickets, and check attendees in — all from one simple platform engineered for digital prestige.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/create-event')}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-xl shadow-purple-600/35 hover:shadow-purple-600/60 transition-all text-sm cursor-pointer"
          >
            Create an Event
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleScrollToDiscover}
            className="bg-white/10 border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/15 transition-all text-sm cursor-pointer"
          >
            Explore Events
          </motion.button>
        </div>
      </motion.div>

      {/* Right Column: Unified Event Card */}
      <div className="lg:col-span-5 flex justify-center lg:justify-end">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm bg-[#11131A]/90 border border-purple-500/30 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-950/50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 pb-5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20 inline-block mb-1.5">
                  Featured Event
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">Midnight Tech Summit</h3>
                <p className="text-xs text-gray-400 mt-1">Oct 24, 2026 • Main Stage</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                <Calendar size={20} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#181B24] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                  <Ticket size={14} className="text-purple-400" />
                  <span>Registered</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-white block">128</span>
              </div>

              <div className="bg-[#181B24] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  <span>Checked In</span>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 block">82</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Digital Pass */}
          <div className="p-6 pt-5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Digital Pass</p>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shrink-0 shadow-inner">
                <QRCode value="VIP-482910" size={72} style={{ height: 'auto', maxWidth: '100%', width: '72px' }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Pass ID</p>
                <span className="inline-block text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 rounded-md">
                  VIP-482910
                </span>
                <p className="text-[11px] text-gray-500 mt-2 leading-snug">Scan at entry for instant check-in.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </main>
  );
}