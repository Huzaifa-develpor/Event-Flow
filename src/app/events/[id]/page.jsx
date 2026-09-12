'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  Building2,
  Ticket,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        const data = await res.json();

        if (data.status !== 'success') {
          throw new Error(data.error || 'Event not found');
        }

        setEvent(data.event);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchSimilarEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.status === 'success') {
          const filtered = (data.events || []).filter((e) => e._id !== params.id);
          setSimilarEvents(filtered);
        }
      } catch (err) {
        console.error('Failed to load similar events', err);
      }
    };

    if (params.id) {
      fetchEvent();
      fetchSimilarEvents();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0C10] text-white pt-24 pb-16 flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Loading event...</p>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-[#0B0C10] text-white pt-24 pb-16 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{error || 'Event not found'}</p>
        <button
          onClick={() => router.back()}
          className="text-xs font-semibold text-gray-400 hover:text-white bg-[#141720] border border-white/10 px-4 py-2 rounded-xl"
        >
          Go Back
        </button>
      </main>
    );
  }

  const cheapestTicket = event.tickets?.reduce(
    (min, t) => (t.price < (min?.price ?? Infinity) ? t : min),
    null
  );

  const organizerName = event.organizerId
    ? `${event.organizerId.firstName} ${event.organizerId.lastName || ''}`.trim()
    : 'Event Organizer';

  const seatsLeft = event.availableSeats ?? event.capacity ?? 0;
  const soldOut = seatsLeft <= 0;

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white pt-24 pb-16 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <motion.button
          whileHover={{ x: -3 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors bg-[#141720] border border-white/10 px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={16} />
          <span>Back to Events</span>
        </motion.button>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-10">
        {/* HERO BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-purple-900/40 via-[#12141A] to-cyan-900/20 flex items-end"
        >
          {event.thumbnail && (
            <>
              <img
                src={event.thumbnail}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/40 to-transparent" />
            </>
          )}

          <div className="p-8 space-y-3 relative z-10">
            <span className="text-[10px] font-bold tracking-wider px-3 py-1 rounded-md border border-purple-500/30 bg-purple-500/20 text-purple-300 uppercase backdrop-blur-md">
              {soldOut ? 'Sold Out' : event.status}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">{event.title}</h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 bg-[#12141A] border border-white/10 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                <Calendar size={22} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Date & Time</h4>
                <p className="text-xs text-gray-300 mt-1">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                <MapPin size={22} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Location</h4>
                <p className="text-xs text-gray-300 mt-1">{event.location}</p>
              </div>
            </div>
          </div>

          {/* TICKET REGISTRATION CARD */}
          <div className="bg-[#12141A] border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl shadow-purple-900/10">
            <div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">REGISTRATION PASS</span>
                <span className={`text-[11px] font-bold ${soldOut ? 'text-red-400' : 'text-rose-400'}`}>
                  {soldOut ? 'Sold out' : `${seatsLeft} seats left`}
                </span>
              </div>
              <div className="text-3xl font-black text-white mt-2">
                {cheapestTicket ? `From Rs. ${cheapestTicket.price}` : 'Free'}
              </div>
              <ul className="mt-4 space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400" /> Guaranteed Reserved Seat
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-purple-400" /> Instant Digital Ticket Pass
                </li>
              </ul>
            </div>

            {soldOut ? (
              <button
                disabled
                className="w-full bg-[#1A1D26] text-gray-500 font-bold text-sm py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Ticket size={16} />
                <span>Sold Out</span>
              </button>
            ) : (
              <Link
                href={`/events/${event._id}/register`}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Ticket size={16} />
                <span>Get Ticket / Register Now</span>
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#12141A] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">About This Event</h3>
            <p className="text-gray-300 text-sm leading-relaxed font-normal whitespace-pre-line">
              {event.description}
            </p>
          </div>

          <hr className="border-white/5" />

          <div className="bg-[#161822] border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 size={20} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Organized By</span>
              <h5 className="text-sm font-bold text-white">{organizerName}</h5>
            </div>
          </div>
        </motion.div>
      </div>

      {similarEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl mx-auto mt-20 pt-10 border-t border-white/10 px-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">More Experiences You Might Like</h3>
            </div>
            <span className="text-xs text-gray-400 hidden sm:inline">Scroll right to explore &rarr;</span>
          </div>

          <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600/40 scrollbar-track-transparent">
            <div className="flex gap-5 min-w-max">
              {similarEvents.map((item) => (
                <Link key={item._id} href={`/events/${item._id}`} className="block group">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="w-72 bg-[#111319] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-purple-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-32 w-full bg-gradient-to-br from-purple-900/40 via-[#12141A] to-cyan-900/20 flex items-center justify-center">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : null}
                        <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase bg-purple-500/20 text-purple-300 border-purple-500/30 absolute top-2.5 left-2.5 z-10">
                          {item.status || 'Active'}
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="space-y-1.5 text-[11px] text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-500" />
                            <span>{item.date ? new Date(item.date).toLocaleDateString() : 'TBA'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-gray-500" />
                            <span className="line-clamp-1">{item.location || 'Online'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between bg-[#0E1015]">
                      <span className="text-[11px] text-purple-400 font-bold">
                        {item.tickets && item.tickets.length > 0 ? `Rs. ${Math.min(...item.tickets.map((t) => t.price))}` : 'Free'}
                      </span>
                      <div className="p-1 rounded text-gray-400 group-hover:text-white group-hover:bg-purple-600 transition-all">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}