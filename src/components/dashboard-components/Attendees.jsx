"use client";

import { useState } from "react";
import { Search, Download, MoreVertical } from "lucide-react";

const statusStyles = {
  "CHECKED IN": "bg-cyan-500/10 text-cyan-400",
  REGISTERED: "bg-purple-500/10 text-purple-300",
  ARRIVING: "bg-white/10 text-gray-300",
  CANCELLED: "bg-white/5 text-gray-500",
};

const filters = ["All", "Registered", "Checked In", "Cancelled"];

export default function Attendees({ attendees = [] }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttendees = attendees.filter((a) => {
    const fullName = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
    const email = (a.email || "").toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());

    const status = a.checkedIn ? "Checked In" : (a.registrationStatus || "Registered");

    if (activeFilter === "All") return matchesSearch;
    if (activeFilter === "Checked In") return matchesSearch && a.checkedIn;
    if (activeFilter === "Registered") return matchesSearch && !a.checkedIn && status !== "Cancelled";
    if (activeFilter === "Cancelled") return matchesSearch && status.toLowerCase() === "cancelled";

    return matchesSearch;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Event Attendees</h1>
        <p className="text-sm text-gray-500 mt-1">
          Total Registered: {attendees.length} &nbsp;•&nbsp; Checked In: {attendees.filter(a => a.checkedIn).length}
        </p>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attendees by name, email, or ticket"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg ${
                  activeFilter === f
                    ? "bg-white/15 text-white"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                {f}
              </button>
            ))}
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-300">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-white/10">
                <th className="p-4 font-normal">Attendee</th>
                <th className="p-4 font-normal">Contact</th>
                <th className="p-4 font-normal">Event / Ticket</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500 text-xs">
                    No attendees found.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((a) => {
                  const initials = `${a.firstName?.[0] || ""}${a.lastName?.[0] || ""}`.toUpperCase() || "U";
                  const statusLabel = a.checkedIn ? "CHECKED IN" : (a.registrationStatus?.toUpperCase() || "REGISTERED");

                  return (
                    <tr key={a.registrationId} className="border-b border-white/5 last:border-0">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-xs text-white font-medium">
                          {initials}
                        </div>
                        <span className="text-white">
                          {a.firstName} {a.lastName}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {a.email}
                        {a.phone && <div className="text-xs text-gray-600">{a.phone}</div>}
                      </td>
                      <td className="p-4 text-gray-400">
                        <span className="text-white">{a.eventTitle || "Event"}</span>
                        <div className="text-xs text-gray-600">{a.ticketType || "Standard"} - ${a.ticketPrice || 0}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[statusLabel] || "bg-purple-500/10 text-purple-300"}`}>
                          {statusLabel}
                        </span>
                        {a.checkedInAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(a.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <button className="text-gray-500 hover:text-white">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}