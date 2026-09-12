'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  Menu, 
  X, 
  LayoutDashboard, 
  User,
  LogOut,
  UserPlus
} from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [user, setUser] = useState({
    isLoggedIn: false,
    role: 'user'
  });

  const pathname = usePathname();
  const router = useRouter();

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      setUser({
        isLoggedIn: true,
        role: role || 'user'
      });
    } else {
      setUser({
        isLoggedIn: false,
        role: 'user'
      });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    checkAuthStatus();

    
    window.addEventListener('auth-change', checkAuthStatus);
    return () => {
      window.removeEventListener('auth-change', checkAuthStatus);
    };
  }, []);

  const handleScrollToDiscover = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (pathname !== '/') {
      router.push('/#discover');
    } else {
      const discoverElement = document.getElementById('discover');
      if (discoverElement) {
        discoverElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser({ isLoggedIn: false, role: 'user' });
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0C10]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">
            EventFlow
          </span>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
          <a href="#discover" onClick={handleScrollToDiscover} className="hover:text-white transition-colors cursor-pointer">
            Events
          </a>

          <a href="#discover" onClick={handleScrollToDiscover} className="hover:text-white transition-colors cursor-pointer">
            Discover
          </a>

          {/* ORGANIZER DASHBOARD BUTTON */}
          {isMounted && user.isLoggedIn && user.role === 'organizer' && (
            <Link 
              href="/organizer/dashboard" 
              className="hover:text-purple-400 transition-colors flex items-center gap-1.5 text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg"
            >
              <LayoutDashboard size={15} className="text-purple-400" />
              <span>For Organizers</span>
            </Link>
          )}
        </nav>

        {/* RIGHT ACTION BUTTONS */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={handleScrollToDiscover}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            title="Search Events"
          >
            <Search size={18} />
          </button>

          {/* NOT LOGGED IN */}
          {isMounted && !user.isLoggedIn && (
            <>
              <Link 
                href="/login" 
                className="text-sm font-semibold text-gray-300 hover:text-white px-3 py-2 transition-colors flex items-center gap-1.5"
              >
                <User size={16} />
                <span>Login</span>
              </Link>

              <Link 
                href="/signup" 
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02]"
              >
                <UserPlus size={16} />
                <span>Sign Up</span>
              </Link>
            </>
          )}

          {/* LOGGED IN USER */}
          {isMounted && user.isLoggedIn && (
            <>
              {user.role === 'organizer' && (
                <Link 
                  href="/create-event" 
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02]"
                >
                  <PlusCircle size={16} />
                  <span>Host Event</span>
                </Link>
              )}

              <button 
                onClick={handleLogout} 
                className="p-2.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20" 
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0F1117] border-b border-white/10 px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-gray-300">
            <a href="#discover" onClick={handleScrollToDiscover} className="py-2 hover:text-white">Events</a>
            <a href="#discover" onClick={handleScrollToDiscover} className="py-2 hover:text-white">Discover</a>

            {isMounted && user.isLoggedIn && user.role === 'organizer' && (
              <Link 
                href="/organizer/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="py-2 hover:text-purple-400 flex items-center gap-2 text-purple-300"
              >
                <LayoutDashboard size={16} />
                <span>For Organizers</span>
              </Link>
            )}
          </nav>

          <hr className="border-white/10" />

          <div className="flex flex-col gap-3 pt-2">
            {isMounted && !user.isLoggedIn ? (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-full text-center py-2.5 rounded-xl border border-white/10 text-sm font-bold text-gray-300 bg-white/5"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-full text-center py-2.5 rounded-xl bg-purple-600 text-sm font-bold text-white shadow-lg shadow-purple-600/30"
                >
                  Sign Up
                </Link>
              </>
            ) : isMounted && user.isLoggedIn ? (
              <>
                {user.role === 'organizer' && (
                  <Link 
                    href="/create-event" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="w-full text-center py-2.5 rounded-xl bg-purple-600 text-sm font-bold text-white shadow-lg shadow-purple-600/30"
                  >
                    Host Event
                  </Link>
                )}
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} 
                  className="w-full text-center py-2.5 rounded-xl border border-rose-500/20 text-sm font-bold text-rose-400 bg-rose-500/10"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}