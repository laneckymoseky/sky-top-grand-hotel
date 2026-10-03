import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">📊 SkyTop Grand Hotel - Admin</h1>
            <p className="text-xs text-gray-500">Utawala, Embakasi</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-gray-600 mt-2">Room Bookings</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-gray-600 mt-2">Event Bookings</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-3xl font-bold text-green-600">KES 0</p>
            <p className="text-gray-600 mt-2">Total Revenue</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-3xl font-bold text-yellow-600">0%</p>
            <p className="text-gray-600 mt-2">Occupancy Rate</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Analytics & Reports</h2>
          <div className="p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-700">Admin analytics features coming soon:</p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>✓ Revenue tracking (rooms + events)</li>
              <li>✓ Occupancy monitoring</li>
              <li>✓ Staff performance metrics</li>
              <li>✓ Monthly comparisons</li>
              <li>✓ Income reports with CSV export</li>
              <li>✓ Guest issue tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
