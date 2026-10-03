import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getCustomerRoomBookings, getCustomerEventBookings } from '../lib/supabase';
import { LogOut, Home, Calendar, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { logout, userProfile } = useAuthStore();
  const [roomBookings, setRoomBookings] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      if (userProfile?.id) {
        const [roomRes, eventRes] = await Promise.all([
          getCustomerRoomBookings(userProfile.id),
          getCustomerEventBookings(userProfile.id),
        ]);
        if (roomRes.success) setRoomBookings(roomRes.data);
        if (eventRes.success) setEventBookings(eventRes.data);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Logged out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* --- FADED BACKGROUND LAYER --- */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{ backgroundImage: "url('/images/sunset.jfif')" }}
      />
      {/* ------------------------------ */}

      {/* Main Content Wrapper (z-10 to stay above background) */}
      <div className="relative z-10">
        
        {/* Header - Made slightly transparent so the sunset bleeds through */}
        <div className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">🏨 SkyTop Grand Hotel</h1>
              <p className="text-xs text-gray-500">Utawala, Embakasi</p>
            </div>
            <div className="space-x-4">
              <span className="text-gray-800 font-medium">Welcome, {userProfile?.full_name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 inline-flex"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Tab Section with Persistent Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'rooms'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/90 text-gray-700 hover:bg-white shadow-sm border border-gray-200'
                }`}
              >
                <Home className="w-5 h-5" />
                Room Bookings
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'events'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white/90 text-gray-700 hover:bg-white shadow-sm border border-gray-200'
                }`}
              >
                <Calendar className="w-5 h-5" />
                Event Bookings
              </button>
            </div>

            {/* Persistent "Book New" Button */}
            {activeTab === 'rooms' ? (
              <Link 
                to="/rooms" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Book New Room
              </Link>
            ) : (
              <Link 
                to="/events" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Book New Event
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : activeTab === 'rooms' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomBookings.length === 0 ? (
                <div className="col-span-3 text-center py-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100">
                  <p className="text-gray-600 text-lg">No room bookings yet</p>
                </div>
              ) : (
                roomBookings.map((booking) => (
                  <div key={booking.id} className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <h3 className="text-lg font-bold mb-2">Room {booking.rooms?.room_number}</h3>
                    <p className="text-gray-600 mb-4">{booking.rooms?.room_type}</p>
                    <div className="space-y-2 text-sm mb-4">
                      <p><strong>Check-in:</strong> {new Date(booking.check_in_date).toLocaleDateString()}</p>
                      <p><strong>Check-out:</strong> {new Date(booking.check_out_date).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> <span className="font-bold text-blue-600 capitalize">{booking.booking_status}</span></p>
                      <p><strong>Total:</strong> KES {booking.actual_price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventBookings.length === 0 ? (
                <div className="col-span-3 text-center py-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100">
                  <p className="text-gray-600 text-lg">No event bookings yet</p>
                </div>
              ) : (
                eventBookings.map((booking) => (
                  <div key={booking.id} className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <h3 className="text-lg font-bold mb-2">{booking.event_venues?.name}</h3>
                    <p className="text-gray-600 mb-4 capitalize">{booking.event_type}</p>
                    <div className="space-y-2 text-sm mb-4">
                      <p><strong>Date:</strong> {new Date(booking.event_date).toLocaleDateString()}</p>
                      <p><strong>Guests:</strong> {booking.expected_guests}</p>
                      <p><strong>Status:</strong> <span className="font-bold text-purple-600 capitalize">{booking.booking_status}</span></p>
                      <p><strong>Total:</strong> KES {booking.actual_price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;