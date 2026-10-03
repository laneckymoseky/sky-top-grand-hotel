import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  LogOut, Download, BedDouble, CalendarDays, Wallet, Percent, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  getAllRoomBookings, getAllEventBookings, getAllRooms, getAllStaff,
  getAllIssues, updateIssueStatus, getIncomeReports,
} from '../lib/supabase';

const COLORS = { rooms: '#2563eb', events: '#9333ea', total: '#16a34a', warn: '#ca8a04' };
const PIE_COLORS = ['#2563eb', '#9333ea'];

const KES = (n) => `KES ${Number(n || 0).toLocaleString()}`;
const isActive = (b) => b.booking_status !== 'cancelled';
const revenueOf = (b) => Number(b.actual_price ?? b.total_price ?? 0);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const SEVERITY_STYLE = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};
const STATUS_STYLE = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

const AdminDashboard = () => {
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    roomBookings: [], eventBookings: [], rooms: [], staff: [], issues: [], incomeReports: [],
  });
  const [issueFilter, setIssueFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [rb, eb, rooms, staff, issues, reports] = await Promise.allSettled([
        getAllRoomBookings(), getAllEventBookings(), getAllRooms(),
        getAllStaff(), getAllIssues(), getIncomeReports(),
      ]);
      setData({
        roomBookings: rb.status === 'fulfilled' && rb.value.success ? rb.value.data : [],
        eventBookings: eb.status === 'fulfilled' && eb.value.success ? eb.value.data : [],
        rooms: rooms.status === 'fulfilled' && rooms.value.success ? rooms.value.data : [],
        staff: staff.status === 'fulfilled' && staff.value.success ? staff.value.data : [],
        issues: issues.status === 'fulfilled' && issues.value.success ? issues.value.data : [],
        incomeReports: reports.status === 'fulfilled' && reports.value.success ? reports.value.data : [],
      });
      setLoading(false);
    };
    load();
  }, []);

  const { roomBookings, eventBookings, rooms, staff, issues, incomeReports } = data;
  const activeRoomBookings = roomBookings.filter(isActive);
  const activeEventBookings = eventBookings.filter(isActive);
  const roomRevenue = activeRoomBookings.reduce((s, b) => s + revenueOf(b), 0);
  const eventRevenue = activeEventBookings.reduce((s, b) => s + revenueOf(b), 0);
  const totalRevenue = roomRevenue + eventRevenue;

  // ---- Occupancy (rooms occupied today) ----
  const today = new Date();
  const occupiedToday = activeRoomBookings.filter((b) => {
    const ci = new Date(b.check_in_date); const co = new Date(b.check_out_date);
    return ci <= today && co >= today;
  }).length;
  const occupancyRate = rooms.length ? Math.round((occupiedToday / rooms.length) * 100) : 0;

  // ---- Last 8 months skeleton ----
  const months = useMemo(() => {
    const arr = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      arr.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('en', { month: 'short' }),
      });
    }
    return arr;
  }, []);

  const monthKeyOf = (b) => {
    const d = new Date(b.check_in_date || b.event_date || b.created_at);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  // ---- Chart 1: Revenue tracking (rooms + events, stacked) ----
  const revenueByMonth = useMemo(() => {
    const map = Object.fromEntries(months.map((m) => [m.key, { ...m, rooms: 0, events: 0 }]));
    activeRoomBookings.forEach((b) => { const k = monthKeyOf(b); if (map[k]) map[k].rooms += revenueOf(b); });
    activeEventBookings.forEach((b) => { const k = monthKeyOf(b); if (map[k]) map[k].events += revenueOf(b); });
    return Object.values(map);
  }, [roomBookings, eventBookings]);

  // ---- Chart 2: Revenue split pie ----
  const revenueSplit = [
    { name: 'Rooms', value: Math.round(roomRevenue) },
    { name: 'Events', value: Math.round(eventRevenue) },
  ];

  // ---- Chart 3: Occupancy trend (last 14 days) ----
  const occupancyTrend = useMemo(() => {
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(today); day.setDate(today.getDate() - i);
      const occ = activeRoomBookings.filter((b) => {
        const ci = new Date(b.check_in_date); const co = new Date(b.check_out_date);
        return ci <= day && co >= day;
      }).length;
      out.push({
        day: day.toLocaleDateString('en', { day: 'numeric', month: 'short' }),
        rate: rooms.length ? Math.round((occ / rooms.length) * 100) : 0,
      });
    }
    return out;
  }, [roomBookings, rooms.length]);

  // ---- Chart 4: Monthly comparison (this month vs last month) ----
  const comparison = useMemo(() => {
    const mk = (offset) => {
      const d = new Date(today.getFullYear(), today.getMonth() - offset, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };
    const cur = mk(0), prev = mk(1);
    const sum = (list, key, field) =>
      list.filter((b) => monthKeyOf(b) === key && isActive(b))
        .reduce((s, b) => s + (field ? revenueOf(b) : 1), 0);
    return {
      revenue: [
        { metric: 'Room Revenue', thisMonth: Math.round(sum(roomBookings, cur, true)), lastMonth: Math.round(sum(roomBookings, prev, true)) },
        { metric: 'Event Revenue', thisMonth: Math.round(sum(eventBookings, cur, true)), lastMonth: Math.round(sum(eventBookings, prev, true)) },
        { metric: 'Total', thisMonth: Math.round(sum(roomBookings, cur, true) + sum(eventBookings, cur, true)), lastMonth: Math.round(sum(roomBookings, prev, true) + sum(eventBookings, prev, true)) },
      ],
      bookings: [
        { metric: 'Room Bookings', thisMonth: sum(roomBookings, cur), lastMonth: sum(roomBookings, prev) },
        { metric: 'Event Bookings', thisMonth: sum(eventBookings, cur), lastMonth: sum(eventBookings, prev) },
      ],
    };
  }, [roomBookings, eventBookings]);

  // ---- Chart 5: Staff performance ----
  const staffPerformance = useMemo(() => {
    return staff.map((s) => ({
      id: s.id,
      name: s.full_name,
      role: s.role,
      department: s.department,
      roomBookings: roomBookings.filter((b) => b.assigned_staff_id === s.id).length,
      eventBookings: eventBookings.filter((b) => b.assigned_staff_id === s.id).length,
      issuesResolved: issues.filter(
        (i) => i.assigned_staff_id === s.id && ['resolved', 'closed'].includes(i.status)
      ).length,
    }));
  }, [staff, roomBookings, eventBookings, issues]);

  // ---- Income report rows ----
  const incomeRows = useMemo(() => {
    if (incomeReports.length) {
      return incomeReports.slice(0, 12).map((r) => ({
        period: `${fmtDate(r.report_period_start)} – ${fmtDate(r.report_period_end)}`,
        roomBookings: r.total_room_bookings ?? 0,
        eventBookings: r.total_event_bookings ?? 0,
        roomRevenue: Number(r.room_revenue ?? 0),
        eventRevenue: Number(r.event_revenue ?? 0),
        totalRevenue: Number(r.total_revenue ?? 0),
        occupancy: r.occupancy_rate ?? 0,
      }));
    }
    return months.slice(-6).map((m) => {
      const rb = activeRoomBookings.filter((b) => monthKeyOf(b) === m.key);
      const eb = activeEventBookings.filter((b) => monthKeyOf(b) === m.key);
      const rr = rb.reduce((s, b) => s + revenueOf(b), 0);
      const er = eb.reduce((s, b) => s + revenueOf(b), 0);
      return {
        period: m.label, roomBookings: rb.length, eventBookings: eb.length,
        roomRevenue: Math.round(rr), eventRevenue: Math.round(er),
        totalRevenue: Math.round(rr + er), occupancy: occupancyRate,
      };
    });
  }, [incomeReports, roomBookings, eventBookings]);

  const exportCSV = () => {
    const header = ['Period', 'Room Bookings', 'Event Bookings', 'Room Revenue (KES)', 'Event Revenue (KES)', 'Total Revenue (KES)', 'Occupancy Rate (%)'];
    const rows = incomeRows.map((r) => [r.period, r.roomBookings, r.eventBookings, r.roomRevenue, r.eventRevenue, r.totalRevenue, r.occupancy]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `skytop-income-report-${today.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Income report exported as CSV');
  };

  const handleIssueStatus = async (issue, status) => {
    const res = await updateIssueStatus(issue.id, status, issue.resolution_notes);
    if (res.success) {
      setData((d) => ({ ...d, issues: d.issues.map((i) => (i.id === issue.id ? { ...i, status } : i)) }));
      toast.success(`Issue marked as ${status.replace('_', ' ')}`);
    } else toast.error(res.error || 'Could not update issue');
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) toast.success('Logged out');
  };

  const kpiCard = (icon, value, label, color) => (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
      <p className="text-gray-600 mt-1 text-sm">{label}</p>
    </div>
  );

  const filteredIssues = issueFilter === 'all' ? issues : issues.filter((i) => i.status === issueFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">📊 SkyTop Grand Hotel - Admin</h1>
            <p className="text-xs text-gray-500">Utawala, Embakasi</p>
          </div>
          <button onClick={handleLogout} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {kpiCard(<BedDouble className="w-6 h-6" />, activeRoomBookings.length, 'Room Bookings', 'text-blue-600')}
              {kpiCard(<CalendarDays className="w-6 h-6" />, activeEventBookings.length, 'Event Bookings', 'text-purple-600')}
              {kpiCard(<Wallet className="w-6 h-6" />, KES(totalRevenue), 'Total Revenue', 'text-green-600')}
              {kpiCard(<Percent className="w-6 h-6" />, `${occupancyRate}%`, `Occupancy (${occupiedToday}/${rooms.length} rooms)`, 'text-yellow-600')}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">Revenue Tracking (Rooms + Events)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueByMonth}>
                    <defs>
                      <linearGradient id="gRooms" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.rooms} stopOpacity={0.7} /><stop offset="95%" stopColor={COLORS.rooms} stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="gEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.events} stopOpacity={0.7} /><stop offset="95%" stopColor={COLORS.events} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => KES(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="rooms" name="Room Revenue" stroke={COLORS.rooms} fill="url(#gRooms)" stackId="1" />
                    <Area type="monotone" dataKey="events" name="Event Revenue" stroke={COLORS.events} fill="url(#gEvents)" stackId="1" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Revenue Split</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={revenueSplit} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {revenueSplit.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => KES(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Occupancy Monitoring (Last 14 Days)</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={occupancyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Line type="monotone" dataKey="rate" name="Occupancy" stroke={COLORS.warn} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Revenue: This vs Last Month</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={comparison.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => KES(v)} />
                    <Legend />
                    <Bar dataKey="thisMonth" name="This Month" fill={COLORS.rooms} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastMonth" name="Last Month" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Bookings: This vs Last Month</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={comparison.bookings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="thisMonth" name="This Month" fill={COLORS.events} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastMonth" name="Last Month" fill="#d8b4fe" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Staff Performance Metrics</h2>
              {staffPerformance.length === 0 ? (
                <p className="text-gray-500">No staff records yet.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={staffPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="roomBookings" name="Assigned Room Bookings" fill={COLORS.rooms} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="eventBookings" name="Assigned Event Bookings" fill={COLORS.events} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="issuesResolved" name="Issues Resolved" fill={COLORS.total} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="py-2">Staff</th>
                          <th>Role</th>
                          <th>Department</th>
                          <th>Room Bookings</th>
                          <th>Event Bookings</th>
                          <th>Issues Resolved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffPerformance.map((s) => (
                          <tr key={s.id} className="border-b last:border-0">
                            <td className="py-2 font-medium">{s.name}</td>
                            <td className="capitalize">{s.role}</td>
                            <td>{s.department || '—'}</td>
                            <td>{s.roomBookings}</td>
                            <td>{s.eventBookings}</td>
                            <td>{s.issuesResolved}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-bold">Income Reports</h2>
                <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2">Period</th>
                      <th>Room Bookings</th>
                      <th>Event Bookings</th>
                      <th>Room Revenue</th>
                      <th>Event Revenue</th>
                      <th>Total</th>
                      <th>Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeRows.map((r, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 font-medium">{r.period}</td>
                        <td>{r.roomBookings}</td>
                        <td>{r.eventBookings}</td>
                        <td>{KES(r.roomRevenue)}</td>
                        <td>{KES(r.eventRevenue)}</td>
                        <td className="font-semibold text-green-700">{KES(r.totalRevenue)}</td>
                        <td>{r.occupancy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" /> Guest Issue Tracking
                  <span className="text-sm font-normal text-gray-500">
                    ({issues.filter((i) => i.status === 'open').length} open)
                  </span>
                </h2>
                <select value={issueFilter} onChange={(e) => setIssueFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              {filteredIssues.length === 0 ? (
                <p className="text-gray-500">No issues found.</p>
              ) : (
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4 flex flex-wrap items-center gap-3 justify-between">
                      <div className="min-w-[220px]">
                        <p className="font-semibold">{issue.issue_title}</p>
                        <p className="text-sm text-gray-500">
                          {issue.customers?.full_name || 'Guest'} · {issue.issue_category?.replace(/_/g, ' ')} · {fmtDate(issue.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${SEVERITY_STYLE[issue.severity] || SEVERITY_STYLE.medium}`}>
                          {issue.severity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_STYLE[issue.status] || ''}`}>
                          {issue.status?.replace(/_/g, ' ')}
                        </span>
                        <select
                          value={issue.status}
                          onChange={(e) => handleIssueStatus(issue, e.target.value)}
                          className="border rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;