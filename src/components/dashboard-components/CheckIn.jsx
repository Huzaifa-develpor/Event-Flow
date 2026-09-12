"use client";

import { useState } from "react";
import { Zap, CheckCircle2, XCircle } from "lucide-react";

export default function CheckIn({ checkInStats }) {
  const [code, setCode] = useState("");

  return (
    <div className="flex flex-col items-center justify-center text-center py-6 md:py-12">
      <div className="mb-6 max-w-md w-full bg-[#111111] border border-white/10 rounded-xl p-4 flex justify-around text-xs">
        <div>
          <p className="text-gray-500">Total</p>
          <p className="text-lg font-bold text-white">{checkInStats?.totalRegistrations || 0}</p>
        </div>
        <div className="border-r border-white/10" />
        <div>
          <p className="text-gray-500">Checked In</p>
          <p className="text-lg font-bold text-cyan-400">{checkInStats?.checkedIn || 0}</p>
        </div>
        <div className="border-r border-white/10" />
        <div>
          <p className="text-gray-500">Remaining</p>
          <p className="text-lg font-bold text-purple-400">{checkInStats?.remaining || 0}</p>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">Scan attendee ticket</h1>
      <p className="text-gray-400 mb-8 max-w-md text-sm">
        Point the camera at the attendee's QR code or enter ticket registration ID manually to verify check-in.
      </p>

      <div className="w-full max-w-md aspect-square rounded-2xl bg-[#111111] border border-white/10 relative overflow-hidden mb-6 flex items-center justify-center">
        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-cyan-400 shadow-[0_0_12px_2px_rgba(34,211,238,0.6)]" />
        <div className="text-gray-600 text-sm">Camera preview</div>
      </div>

      <div className="flex items-center gap-3 w-full max-w-md">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter ticket ID code manually"
          className="flex-1 bg-[#111111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500"
        />
        <button className="p-3 rounded-lg bg-[#111111] border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
          <Zap size={18} />
        </button>
      </div>
    </div>
  );
}