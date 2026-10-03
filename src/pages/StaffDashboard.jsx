import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { logout, userProfile } = useAuthStore();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">👷 SkyTop Grand Hotel - Staff</h1>
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
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Welcome, {userProfile?.full_name}!</h2>
          <p className="text-gray-600 mb-4">Role: {userProfile?.role}</p>
          <p className="text-gray-600">Department: {userProfile?.department}</p>
          
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-700">Staff dashboard features coming soon:</p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>✓ View assigned room bookings</li>
              <li>✓ Update room cleaning status</li>
              <li>✓ Respond to customer messages</li>
              <li>✓ Manage event setup</li>
              <li>✓ Track guest issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
