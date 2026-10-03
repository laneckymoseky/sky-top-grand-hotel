import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import RoomsBrowsePage from './pages/RoomsBrowsePage';
import RoomDetailPage from './pages/RoomDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import BookingPage from './pages/BookingPage';
import EventBookingPage from './pages/EventBookingPage';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import ReviewPage from './pages/ReviewPage';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/rooms" element={<RoomsBrowsePage />} />
        <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:venueId" element={<EventDetailPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="/booking/:roomId"
          element={
            <ProtectedRoute requiredRole="customer">
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event-booking/:venueId"
          element={
            <ProtectedRoute requiredRole="customer">
              <EventBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/customer"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute requiredRole="customer">
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:bookingId"
          element={
            <ProtectedRoute requiredRole="customer">
              <ReviewPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Staff Routes */}
        <Route
          path="/dashboard/staff"
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
