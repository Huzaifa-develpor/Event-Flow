import Link from "next/link";
import { Calendar, MapPin, Users, ArrowUpRight } from "lucide-react";

export default function MyEvents({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-xl p-8 text-center">
        <p className="text-gray-400 text-sm">You haven't created any events yet.</p>
        <Link
          href="/create-event"
          className="inline-block mt-4 text-xs bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-500 transition-colors"
        >
          Create First Event
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Events</h1>
          <p className="text-xs text-gray-400">Manage and view details of your hosted events</p>
        </div>
        <Link
          href="/create-event"
          className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          + Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((item) => (
          <div
            key={item._id}
            className="group bg-[#111111] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all flex flex-col justify-between"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {item.status || "published"}
                </span>
                <span className="text-xs font-semibold text-white">
                  PKR {item.tickets?.[0]?.price || item.ticketPrice || 0}
                </span>
              </div>

              {/* Dynamic Link for Event Title */}
              <Link
                href={`/events/${item._id}`}
                className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1 block mb-2"
              >
                {item.title}
              </Link>

              <div className="space-y-2 text-xs text-gray-400 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-purple-400 shrink-0" />
                  <span>
                    {item.date
                      ? new Date(item.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Date TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-purple-400 shrink-0" />
                  <span className="truncate">{item.location || "Location TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-purple-400 shrink-0" />
                  <span>
                    {item.totalRegistrations || 0} / {item.capacity} Registered
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Card Footer Button Link */}
            <div className="border-t border-white/5 p-4 bg-white/[0.02]">
              <Link
                href={`/events/${item._id}`}
                className="w-full text-xs font-medium text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                View Full Details
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}