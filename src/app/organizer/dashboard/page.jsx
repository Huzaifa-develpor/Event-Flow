"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutGrid,
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Plus,
  Menu,
  X,
  Loader2,
} from "lucide-react";

import Overview from "@/components/dashboard-components/Overview";
import MyEvents from "@/components/dashboard-components/MyEvents";
import Attendees from "@/components/dashboard-components/Attendees";
import CheckIn from "@/components/dashboard-components/CheckIn";
import Analytics from "@/components/dashboard-components/Analytics";

const navItems = [
  { key: "overview", name: "Overview", icon: LayoutGrid },
  { key: "my-events", name: "My Events", icon: Calendar },
  { key: "attendees", name: "Attendees", icon: Users },
  { key: "check-in", name: "Check-in", icon: QrCode },
  { key: "analytics", name: "Analytics", icon: BarChart3 },
];

export default function OrganizerDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch("/api/organizer/dashboard", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setDashboardData(data.dashboard);
        } else {
          setError(data.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderSection = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-cyan-400" />
          <p className="text-sm">Loading dashboard data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm my-6">
          {error}
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <Overview
            overview={dashboardData?.overview}
            analytics={dashboardData?.registrationAnalytics}
            recentActivity={dashboardData?.recentActivity}
          />
        );
      case "my-events":
        return <MyEvents events={dashboardData?.myEvents} />;
      case "attendees":
        return <Attendees attendees={dashboardData?.attendees} />;
      case "check-in":
        return <CheckIn checkInStats={dashboardData?.checkInStats} />;
      case "analytics":
        return (
          <Analytics
            overview={dashboardData?.overview}
            analytics={dashboardData?.registrationAnalytics}
            checkInStats={dashboardData?.checkInStats}
            attendees={dashboardData?.attendees}
          />
        );
      default:
        return (
          <Overview
            overview={dashboardData?.overview}
            analytics={dashboardData?.registrationAnalytics}
            recentActivity={dashboardData?.recentActivity}
          />
        );
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="mb-6 px-2">
        <h2 className="text-lg font-bold text-white">Dashboard</h2>
        <p className="text-xs text-gray-500">Organizer Panel</p>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-white/10 mt-auto">
        <Link
          href="/create-event"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Create Event
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">
      {/* Desktop Sidebar (Only visible on MD screens & above) */}
      <aside className="hidden md:flex md:flex-col md:w-64 min-h-screen bg-[#0f0f0f] border-r border-white/10 p-5 shrink-0">
        <SidebarContent />
      </aside>

      {/* Floating Single Mobile Navigation Button */}
      <div className="md:hidden p-4 pb-0 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#151515] hover:bg-[#1f1f1f] border border-white/10 text-xs font-medium text-gray-300"
        >
          <Menu size={16} className="text-purple-400" />
          <span>Dashboard Menu</span>
        </button>
      </div>

      {/* Mobile Drawer Menu (Slide-in) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="md:hidden fixed top-0 left-0 h-full w-[260px] bg-[#111111] border-r border-white/10 p-5 z-50 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main View Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}