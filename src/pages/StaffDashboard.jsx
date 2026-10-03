import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  LogOut, BedDouble, Sparkles, MessageSquare, CalendarDays, AlertTriangle, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getStaffByEmail, getAssignedRoomBookings, getAssignedEventBookings,
  getAssignedIssues, updateIssueStatus, getAllConversations, sendMessage,
  markCustomerMessagesRead, getAllRooms, getRoomCleaningLogs, createCleaningLog,
  updateRoomStatus, updateEventBookingStatus, updateRoomBookingStatus,
} from '../lib/supabase';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const BOOKING_STATUS = {
  confirmed: 'bg-blue-100 text-blue-800', checked_in: 'bg-green-100 text-green-800',
  checked_out: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-800',
};
const EVENT_STATUS = {
  confirmed: 'bg-blue-100 text-blue-800', setup_complete: 'bg-purple-100 text-purple-800',
  event_ongoing: 'bg-yellow-100 text-yellow-800', completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
const ISSUE_STATUS = {
  open: 'bg-red-100 text-red-800', in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800', closed: 'bg-gray-100 text-gray-600',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: BedDouble },
  { id: 'bookings', label: 'My Room Bookings', icon: BedDouble },
  { id: 'cleaning', label: 'Room Cleaning', icon: Sparkles },
  { id: 'messages', label: 'Guest Messages', icon: MessageSquare },
  { id: 'events', label: 'Event Setup', icon: CalendarDays },
  { id: 'issues', label: 'Guest Issues', icon: AlertTriangle },
];

const StaffDashboard = () => {
  const { logout, userProfile } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [staffRecord, setStaffRecord] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [issues, setIssues] = useState([]);
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [cleaningLogs, setCleaningLogs] = useState([]);

  // cleaning form
  const [cleanRoom, setCleanRoom] = useState('');
  const [cleanStatus, setCleanStatus] = useState('in_progress');
  const [cleanRating, setCleanRating] = useState(5);
  const [cleanNotes, setCleanNotes] = useState('');

  // messaging
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let staff = userProfile?.id ? userProfile : null;
      if (!staff && userProfile?.email) {
        const res = await getStaffByEmail(userProfile.email);
        if (res.success && res.data) staff = res.data;
      }
      setStaffRecord(staff);
      const sid = staff?.id;
      const [rb, eb, iss, msgs, rms, logs] = await Promise.allSettled([
        sid ? getAssignedRoomBookings(sid) : Promise.resolve({ success: true, data: [] }),
        sid ? getAssignedEventBookings(sid) : Promise.resolve({ success: true, data: [] }),
        sid ? getAssignedIssues(sid) : Promise.resolve({ success: true, data: [] }),
        getAllConversations(),
        getAllRooms(),
        sid ? getRoomCleaningLogs(sid) : Promise.resolve({ success: true, data: [] }),
      ]);
      setBookings(rb.status === 'fulfilled' && rb.value.success ? rb.value.data : []);
      setEvents(eb.status === 'fulfilled' && eb.value.success ? eb.value.data : []);
      setIssues(iss.status === 'fulfilled' && iss.value.success ? iss.value.data : []);
      setMessages(msgs.status === 'fulfilled' && msgs.value.success ? msgs.value.data : []);
      setRooms(rms.status === 'fulfilled' && rms.value.success ? rms.value.data : []);
      setCleaningLogs(logs.status === 'fulfilled' && logs.value.success ? logs.value.data : []);
      setLoading(false);
    };
    load();
  }, [userProfile]);

  // group messages into conversations by customer
  const conversations = useMemo(() => {
    const map = new Map();
    messages.forEach((m) => {
      if (!map.has(m.customer_id)) map.set(m.customer_id, { customer: m.customers, messages: [], unread: 0 });
      const c = map.get(m.customer_id);
      c.messages.push(m);
      if (m.sender_type === 'customer' && !m.is_read) c.unread += 1;
    });
    return [...map.values()].sort((a, b) => b.unread - a.unread);
  }, [messages]);

  const activeConv = conversations.find((c) => c.customer?.full_name === activeCustomer) ||
    conversations.find((c) => c.customer?.id === activeCustomer);

  const openConversation = async (conv) => {
    setActiveCustomer(conv.customer?.id);
    if (conv.unread > 0) {
      await markCustomerMessagesRead(conv.customer?.id);
      setMessages((ms) => ms.map((m) =>
        m.customer_id === conv.customer?.id && m.sender_type === 'customer' ? { ...m, is_read: true } : m
      ));
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !activeConv || !staffRecord?.id) return;
    const res = await sendMessage({
      customer_id: activeConv.customer?.id,
      staff_id: staffRecord.id,
      message_text: replyText.trim(),
      sender_type: 'staff',
      is_read: true,
    });
    if (res.success) {
      setMessages((ms) => [...ms, res.data]);
      setReplyText('');
      toast.success('Reply sent');
    } else toast.error(res.error || 'Could not send reply');
  };

  const submitCleaning = async () => {
    if (!cleanRoom) return toast.error('Please select a room');
    const res = await createCleaningLog({
      room_id: cleanRoom,
      assigned_staff_id: staffRecord?.id,
      cleaning_date: new Date().toISOString().slice(0, 10),
      status: cleanStatus,
      cleanliness_rating: cleanRating,
      notes: cleanNotes || null,
      completed_at: cleanStatus === 'completed' ? new Date().toISOString() : null,
    });
    if (res.success) {
      // keep the room's status in sync
      await updateRoomStatus(cleanRoom, cleanStatus === 'completed' ? 'available' : 'cleaning');
      setCleaningLogs((l) => [res.data, ...l]);
      setCleanNotes('');
      toast.success(`Cleaning marked as ${cleanStatus.replace('_', ' ')}`);
    } else toast.error(res.error || 'Could not save cleaning log');
  };

  const handleIssueStatus = async (issue, status) => {
    const res = await updateIssueStatus(issue.id, status, issue.resolution_notes);
    if (res.success) {
      setIssues((is) => is.map((i) => (i.id === issue.id ? { ...i, status } : i)));
      toast.success(`Issue ${status.replace('_', ' ')}`);
    } else toast.error(res.error || 'Update failed');
  };

  const handleEventStatus = async (ev, status) => {
    const res = await updateEventBookingStatus(ev.id, status);
    if (res.success) {
      setEvents((es) => es.map((e) => (e.id === ev.id ? { ...e, booking_status: status } : e)));
      toast.success(`Event marked as ${status.replace(/_/g, ' ')}`);
    } else toast.error(res.error || 'Update failed');
  };

  const handleBookingStatus = async (b, status) => {
    const res = await updateRoomBookingStatus(b.id, status);
    if (res.success) {
      setBookings((bs) => bs.map((x) => (x.id === b.id ? { ...x, booking_status: status } : x)));
      toast.success(`Booking marked as ${status.replace(/_/g, ' ')}`);
    } else toast.error(res.error || 'Update failed');
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) toast.success('Logged out');
  };

  const openIssues = issues.filter((i) => i.status === 'open').length;

  const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>{children}</div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">👷 SkyTop Grand Hotel - Staff</h1>
            <p className="text-xs text-gray-500">Utawala, Embakasi</p>
          </div>
          <button onClick={handleLogout} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Welcome, {userProfile?.full_name}!</h2>
          <p className="text-gray-600">Role: {userProfile?.role} · Department: {userProfile?.department}</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                tab === t.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
              {t.id === 'messages' && conversations.some((c) => c.unread > 0) && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5">
                  {conversations.reduce((s, c) => s + c.unread, 0)}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* ---------- OVERVIEW ---------- */}
            {tab === 'overview' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Assigned Room Bookings', value: bookings.length, color: 'text-blue-600' },
                  { label: 'Assigned Event Bookings', value: events.length, color: 'text-purple-600' },
                  { label: 'Open Guest Issues', value: openIssues, color: 'text-red-600' },
                  { label: 'Unread Guest Messages', value: conversations.reduce((s, c) => s + c.unread, 0), color: 'text-green-600' },
                ].map((k) => (
                  <Card key={k.label} className="text-center">
                    <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
                    <p className="text-gray-600 mt-2 text-sm">{k.label}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* ---------- ASSIGNED ROOM BOOKINGS ---------- */}
            {tab === 'bookings' && (
              <Card>
                <h3 className="text-xl font-bold mb-4">My Assigned Room Bookings</h3>
                {bookings.length === 0 ? <p className="text-gray-500">No room bookings assigned to you yet.</p> : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="border rounded-lg p-4 flex flex-wrap items-center gap-3 justify-between">
                        <div>
                          <p className="font-semibold">
                            Room {b.rooms?.room_number} ({b.rooms?.room_type})
                          </p>
                          <p className="text-sm text-gray-500">
                            {b.customers?.full_name} · {b.customers?.phone || 'no phone'} ·{' '}
                            {fmtDate(b.check_in_date)} → {fmtDate(b.check_out_date)} · {b.number_of_guests} guest(s)
                          </p>
                          {b.special_requests && <p className="text-sm text-blue-700 mt-1">“{b.special_requests}”</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${BOOKING_STATUS[b.booking_status] || ''}`}>
                            {b.booking_status?.replace(/_/g, ' ')}
                          </span>
                          <select value={b.booking_status} onChange={(e) => handleBookingStatus(b, e.target.value)}
                            className="border rounded-lg px-2 py-1 text-sm">
                            <option value="confirmed">Confirmed</option>
                            <option value="checked_in">Checked In</option>
                            <option value="checked_out">Checked Out</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* ---------- ROOM CLEANING ---------- */}
            {tab === 'cleaning' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-xl font-bold mb-4">Update Room Cleaning Status</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Room</label>
                      <select value={cleanRoom} onChange={(e) => setCleanRoom(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                        <option value="">Select a room…</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            Room {r.room_number} — {r.room_type} ({r.status})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Status</label>
                      <select value={cleanStatus} onChange={(e) => setCleanStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Cleanliness Rating: {cleanRating}/5</label>
                      <input type="range" min="1" max="5" value={cleanRating}
                        onChange={(e) => setCleanRating(Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Notes</label>
                      <textarea value={cleanNotes} onChange={(e) => setCleanNotes(e.target.value)} rows={2}
                        className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Changed linens, restocked minibar…" />
                    </div>
                    <button onClick={submitCleaning} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                      Save Cleaning Status
                    </button>
                    <p className="text-xs text-gray-400">Completing a cleaning marks the room as available; starting one marks it as cleaning.</p>
                  </div>
                </Card>
                <Card>
                  <h3 className="text-xl font-bold mb-4">My Cleaning History</h3>
                  {cleaningLogs.length === 0 ? <p className="text-gray-500">No cleaning logs yet.</p> : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {cleaningLogs.map((l) => (
                        <div key={l.id} className="border rounded-lg p-3 text-sm flex justify-between items-center">
                          <div>
                            <p className="font-medium">Room {l.rooms?.room_number} — {l.rooms?.room_type}</p>
                            <p className="text-gray-500">{fmtDate(l.cleaning_date)} · Rating {l.cleanliness_rating ?? '—'}/5 {l.notes ? `· ${l.notes}` : ''}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                            l.status === 'completed' ? 'bg-green-100 text-green-800' :
                            l.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {l.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ---------- GUEST MESSAGES ---------- */}
            {tab === 'messages' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <h3 className="text-xl font-bold mb-4">Conversations</h3>
                  {conversations.length === 0 ? <p className="text-gray-500">No guest messages yet.</p> : (
                    <div className="space-y-2">
                      {conversations.map((c) => (
                        <button key={c.customer?.id} onClick={() => openConversation(c)}
                          className={`w-full text-left border rounded-lg p-3 hover:bg-blue-50 transition ${activeCustomer === c.customer?.id ? 'bg-blue-50 border-blue-400' : ''}`}>
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-sm">{c.customer?.full_name || 'Guest'}</p>
                            {c.unread > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2">{c.unread}</span>}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{c.messages[c.messages.length - 1]?.message_text}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
                <Card className="lg:col-span-2 flex flex-col">
                  <h3 className="text-xl font-bold mb-4">
                    {activeConv ? `Chat with ${activeConv.customer?.full_name}` : 'Select a conversation'}
                  </h3>
                  {activeConv ? (
                    <>
                      <div className="flex-1 border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto bg-gray-50 mb-4">
                        {activeConv.messages.map((m) => (
                          <div key={m.id} className={`flex ${m.sender_type === 'staff' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                              m.sender_type === 'staff' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                              <p>{m.message_text}</p>
                              <p className={`text-[10px] mt-1 ${m.sender_type === 'staff' ? 'text-blue-100' : 'text-gray-400'}`}>
                                {new Date(m.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                          placeholder="Type a reply…" className="flex-1 border rounded-lg px-4 py-2" />
                        <button onClick={sendReply} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                          <Send className="w-4 h-4" /> Send
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">Choose a guest conversation on the left to respond.</p>
                  )}
                </Card>
              </div>
            )}

            {/* ---------- EVENT SETUP ---------- */}
            {tab === 'events' && (
              <Card>
                <h3 className="text-xl font-bold mb-4">My Assigned Events</h3>
                {events.length === 0 ? <p className="text-gray-500">No events assigned to you yet.</p> : (
                  <div className="space-y-3">
                    {events.map((ev) => (
                      <div key={ev.id} className="border rounded-lg p-4 flex flex-wrap items-center gap-3 justify-between">
                        <div>
                          <p className="font-semibold">{ev.event_type?.replace(/_/g, ' ')} at {ev.event_venues?.name}</p>
                          <p className="text-sm text-gray-500">
                            {ev.customers?.full_name} · {fmtDate(ev.event_date)} · {ev.start_time?.slice(0, 5)}–{ev.end_time?.slice(0, 5)} · {ev.expected_guests} guests
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {[ev.catering_required && 'Catering', ev.decoration_required && 'Decoration', ev.photography_required && 'Photography']
                              .filter(Boolean).join(' · ') || 'No extra services'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${EVENT_STATUS[ev.booking_status] || ''}`}>
                            {ev.booking_status?.replace(/_/g, ' ')}
                          </span>
                          <select value={ev.booking_status} onChange={(e) => handleEventStatus(ev, e.target.value)}
                            className="border rounded-lg px-2 py-1 text-sm">
                            <option value="confirmed">Confirmed</option>
                            <option value="setup_complete">Setup Complete</option>
                            <option value="event_ongoing">Event Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* ---------- GUEST ISSUES ---------- */}
            {tab === 'issues' && (
              <Card>
                <h3 className="text-xl font-bold mb-4">My Assigned Guest Issues</h3>
                {issues.length === 0 ? <p className="text-gray-500">No issues assigned to you.</p> : (
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <div key={issue.id} className="border rounded-lg p-4">
                        <div className="flex flex-wrap items-center gap-3 justify-between">
                          <div>
                            <p className="font-semibold">{issue.issue_title}</p>
                            <p className="text-sm text-gray-500 capitalize">
                              {issue.customers?.full_name} · {issue.issue_category?.replace(/_/g, ' ')} · {issue.severity} severity · reported {fmtDate(issue.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${ISSUE_STATUS[issue.status] || ''}`}>
                              {issue.status?.replace(/_/g, ' ')}
                            </span>
                            <select value={issue.status} onChange={(e) => handleIssueStatus(issue, e.target.value)}
                              className="border rounded-lg px-2 py-1 text-sm">
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{issue.issue_description}</p>
                        {issue.resolution_notes && (
                          <p className="text-sm text-green-700 mt-1">Resolution: {issue.resolution_notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
