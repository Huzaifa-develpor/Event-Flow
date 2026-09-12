import { CalendarCheck, UserPlus, UserCheck, CalendarClock } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";

export default function Overview({ overview, analytics = [], recentActivity = [] }) {
  const stats = [
    { icon: CalendarCheck, label: "Total Events", value: overview?.totalEvents || 0 },
    { icon: UserPlus, label: "Total Registrations", value: overview?.totalRegistrations || 0 },
    { icon: UserCheck, label: "Checked In (Avg)", value: `${overview?.checkedInAverage || 0}%` },
    { icon: CalendarClock, label: "Upcoming this Week", value: overview?.upcomingThisWeek || 0, highlight: true },
  ];

  const chartData = analytics.slice(-7).map((item) => ({
    day: item.date ? item.date.slice(5) : "",
    value: item.registrations || 0,
  }));

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Organizer Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-xl border p-5 ${
                s.highlight ? "bg-purple-500/10 border-purple-500/30" : "bg-[#111111] border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-white/5">
                  <Icon size={18} className="text-gray-300" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Registration Analytics</h2>
            <span className="text-xs bg-white/5 text-gray-400 px-3 py-1 rounded-full">
              Recent 7 Days
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="value" fill="#a78bfa" radius={[6, 6, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-gray-500">No recent activity found.</p>
          ) : (
            <ul className="space-y-4 text-sm">
              {recentActivity.slice(0, 5).map((act, idx) => (
                <li key={idx}>
                  <p className="text-gray-300">{act.message}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(act.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}