'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  MapPin,
  Heart,
  ArrowRight,
  RefreshCw,
  X,
  Filter,
  ChevronDown
} from 'lucide-react';

export default function DiscoverSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [likedEvents, setLikedEvents] = useState({});
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();

        if (data.status !== 'success') {
          throw new Error(data.error || 'Failed to load events');
        }

        setEvents(data.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    const tags = new Set(['All']);
    events.forEach((e) => {
      if (e.category) tags.add(e.category);
      if (e.tags && Array.isArray(e.tags)) {
        e.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [events]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return events.filter((e) =>
      e.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, events]);

  const filteredEvents = useMemo(() => {
    return events.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCategory = true;
      if (selectedCategory !== 'All') {
        const categoryQuery = selectedCategory.toLowerCase();

        const hasInCategory = item.category?.toLowerCase() === categoryQuery;
        const hasInTags = item.tags && item.tags.some(tag => tag.toLowerCase() === categoryQuery);
        const hasInTitle = item.title?.toLowerCase().includes(categoryQuery);
        const hasInDescription = item.description?.toLowerCase().includes(categoryQuery);

        let customMatch = false;
        if (selectedCategory === 'Tech') {
          const techKeywords = ['tech', 'software', 'code', 'developer', 'web', 'ai', 'data'];
          customMatch = techKeywords.some(
            (key) =>
              item.title?.toLowerCase().includes(key) ||
              item.description?.toLowerCase().includes(key)
          );
        } else if (selectedCategory === 'UI/UX' || selectedCategory === 'Design') {
          const designKeywords = ['design', 'ui', 'ux', 'frontend', 'figma', 'product'];
          customMatch = designKeywords.some(
            (key) =>
              item.title?.toLowerCase().includes(key) ||
              item.description?.toLowerCase().includes(key)
          );
        }

        matchesCategory =
          hasInCategory || hasInTags || hasInTitle || hasInDescription || customMatch;
      }

      let matchesDate = true;
      if (selectedDate !== 'All' && item.date) {
        const eventDate = new Date(item.date);
        const today = new Date();

        if (selectedDate === 'Upcoming') {
          matchesDate = eventDate >= today;
        } else if (selectedDate === 'This Month') {
          matchesDate =
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear();
        }
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [searchQuery, selectedCategory, selectedDate, events]);

  const displayedEvents = useMemo(() => {
    if (showAllEvents) return filteredEvents;
    return filteredEvents.slice(0, 3);
  }, [filteredEvents, showAllEvents]);

  const toggleLike = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const cheapestPrice = (event) => {
    if (!event.tickets || event.tickets.length === 0) return 'Free';
    const min = Math.min(...event.tickets.map((t) => t.price));
    return `Rs. ${min}`;
  };

  return (
    <section
      id="discover"
      className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-16 overflow-hidden"
      onClick={() => setShowSuggestions(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3 mb-10"
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
          Discover your next <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            experience.
          </span>
        </h2>
        <p className="text-gray-400 text-base sm:text-lg max-w-xl font-normal">
          Find workshops, meetups, conferences, and experiences happening around you.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-[#12141A]/90 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-xl mb-12 shadow-2xl relative z-30 flex flex-col md:flex-row items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search events by name..."
            className="w-full bg-[#0B0C10] border border-white/5 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#161922] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto"
              >
                {suggestions.map((item) => (
                  <Link
                    key={item._id}
                    href={`/events/${item._id}`}
                    className="px-4 py-3 hover:bg-purple-600/20 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-none"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.location}</p>
                    </div>
                    <span className="text-xs text-purple-400 font-medium">{cheapestPrice(item)}</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-40 appearance-none bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer transition-all pr-8"
            >
              <option value="All">All Categories</option>
              <option value="Tech">Tech</option>
              <option value="Design">Design</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Workshop">Workshop</option>
              <option value="Conference">Conference</option>
              <option value="Meetup">Meetup</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 md:flex-initial">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-36 appearance-none bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer transition-all pr-8"
            >
              <option value="All">All Dates</option>
              <option value="Upcoming">Upcoming</option>
              <option value="This Month">This Month</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {loading && <p className="text-gray-400 text-sm text-center py-10 animate-pulse">Loading events...</p>}
      {error && <p className="text-red-400 text-sm text-center py-10">{error}</p>}

      {!loading && !error && (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {displayedEvents.map((item) => {
              const seatsLeft = item.availableSeats ?? item.capacity ?? 0;
              const soldOut = seatsLeft <= 0;

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/events/${item._id}`} className="block group h-full">
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="h-full bg-[#111319] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-purple-900/40 via-[#12141A] to-cyan-900/20 flex items-center justify-center">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : null}

                          <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md uppercase bg-purple-500/20 text-purple-300 border-purple-500/30 absolute top-3 left-3 z-10">
                            {soldOut ? 'Sold Out' : (item.status || 'Active')}
                          </span>

                          <button
                            onClick={(e) => toggleLike(e, item._id)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white backdrop-blur-md border border-white/10 transition-all z-10"
                          >
                            <Heart size={15} className={likedEvents[item._id] ? 'fill-red-500 text-red-500' : ''} />
                          </button>
                        </div>

                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                              {item.title}
                            </h3>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-[#1A1D26] border-white/10 text-white whitespace-nowrap">
                              {cheapestPrice(item)}
                            </span>
                          </div>
                          <div className="space-y-2 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-500" />
                              <span>{item.date ? new Date(item.date).toLocaleDateString() : 'TBA'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-gray-500" />
                              <span>{item.location || 'Online'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between bg-[#0E1015]">
                        <span className={`text-xs font-medium ${soldOut ? 'text-red-400' : 'text-gray-400'}`}>
                          {soldOut ? 'No seats left' : `${seatsLeft} seats left`}
                        </span>
                        <div className="p-1.5 rounded-lg text-gray-400 group-hover:text-white group-hover:bg-purple-600 transition-all">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredEvents.length === 0 && (
            <p className="text-gray-400 text-sm col-span-full text-center py-10">No events found matching your filter.</p>
          )}
        </motion.div>
      )}

      {!loading && filteredEvents.length > 3 && (
        <div className="mt-12 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowAllEvents(!showAllEvents)}
            className="flex items-center gap-2 bg-[#14161D] hover:bg-[#1C1F2A] border border-white/10 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all shadow-lg"
          >
            <span>{showAllEvents ? 'Show Less' : 'Load More Events'}</span>
            <RefreshCw size={14} className={`text-gray-400 transition-transform duration-300 ${showAllEvents ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>
      )}
    </section>
  );
}