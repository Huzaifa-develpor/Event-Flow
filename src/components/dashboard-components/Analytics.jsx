import { DollarSign, UserCheck2, UsersRound, Star } from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
} from "recharts";

export default function Analytics({ overview, analytics = [], checkInStats, attendees = [] }) {
  // Fallback calculation: Agar overview.totalRevenue backend se na aye to attendees array se sum le lo
  const revenueCalculated = overview?.totalRevenue ?? attendees.reduce((acc, curr) => {
    return acc + (Number(curr.ticketPrice) || 0);
  }, 0);

  const formattedRevenue = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(revenueCalculated);

  const topStats = [
    {
      icon: DollarSign,
      label: "TOTAL REVENUE",
      value: formattedRevenue,
      change: "Tickets sales from hosted events",
    },
    {
      icon: UserCheck2,
      label: "AVG CHECK-IN RATE",
      value: `${overview?.checkedInAverage || 0}%`,
      change: "Overall average",
    },
    {
      icon: UsersRound,
      label: "ACTIVE REGISTRATIONS",
      value: overview?.totalRegistrations || 0,
      change: "All time registrations",
    },
    {
      icon: Star,
      label: "TOTAL EVENTS",
      value: overview?.totalEvents || 0,
      change: "Hosted events count",
    },
  ];

  // Trimming 30 days analytics down to last 6-7 entries
  const trendData = analytics.slice(-7).map((item) => ({
    day: item.date ? item.date.slice(5) : "",
    reg: item.registrations || 0,
  }));

  const checkinData = [
    { name: "Arrived", value: checkInStats?.checkedIn || 0 },
    { name: "Pending", value: checkInStats?.remaining || 1 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Analytics Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {topStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{s.label}</span>
                <Icon size={16} className="text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-cyan-400 mt-1">{s.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-1">Registration Trends</h2>
          <p className="text-xs text-gray-500 mb-4">Daily active registrations overview</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
              <Area type="monotone" dataKey="reg" stroke="#c4b5fd" fill="#c4b5fd22" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-xl p-5 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-1">Check-in Status</h2>
          <p className="text-xs text-gray-500 mb-2">Across all active events</p>

          <div className="relative w-full h-[190px] flex items-center justify-center my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={checkinData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill="#22d3ee" />
                  <Cell fill="#a78bfa" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white leading-none">
                {checkInStats?.percentage || 0}%
              </span>
              <span className="text-[11px] text-gray-400 mt-1">Checked In</span>
            </div>
          </div>

          <div className="w-full flex justify-between text-sm border-t border-white/10 pt-3 mt-auto">
            <span className="text-gray-400">Arrived</span>
            <span className="text-white font-medium">{checkInStats?.checkedIn || 0}</span>
          </div>
          <div className="w-full flex justify-between text-sm mt-2">
            <span className="text-gray-400">Pending</span>
            <span className="text-white font-medium">{checkInStats?.remaining || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}