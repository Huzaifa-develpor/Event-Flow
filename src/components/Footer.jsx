'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#08090C]/80 backdrop-blur-md py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <span className="text-xl font-black text-white">EventFlow</span>
          <p className="text-xs text-gray-500 mt-1">
            © 2024 EventFlow. Digital Prestige Management.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 sm:gap-12 text-xs sm:text-sm text-gray-400 w-full md:w-auto">
          <div className="flex flex-col gap-2.5">
            <a href="#" className="hover:text-white transition-colors">Events</a>
            <a href="#" className="hover:text-white transition-colors">Organizers</a>
          </div>
          <div className="flex flex-col gap-2.5">
            <a href="#" className="hover:text-white transition-colors">Discover</a>
            <a href="#" className="hover:text-white transition-colors">About Us</a>
          </div>
          <div className="flex flex-col gap-2.5">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Newsletter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}