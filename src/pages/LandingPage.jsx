import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Calendar, MessageSquare, Star, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 doodle-bg">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">🏨 SkyTop Grand Hotel</h1>
            <p className="text-xs text-gray-500">Utawala, Embakasi</p>
          </div>
          <div className="space-x-4">
            <Link to="/rooms" className="text-gray-600 hover:text-blue-600 font-semibold">
              Rooms
            </Link>
            <Link to="/events" className="text-gray-600 hover:text-purple-600 font-semibold">
              Events
            </Link>
            <Link to="/auth" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-2">
            Welcome to SkyTop Grand Hotel
          </h2>
          <p className="text-lg text-gray-500 mb-6">Utawala, Embakasi</p>
          <p className="text-xl text-gray-600 mb-8">
            Luxury accommodation meets unforgettable events
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/rooms"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-bold"
            >
              Browse Rooms <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/events"
              className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 text-lg font-bold"
            >
              Book an Event <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Premium Rooms</h3>
            <p className="text-gray-600">Luxury suites with exclusive amenities</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Event Venues</h3>
            <p className="text-gray-600">Perfect spaces for your special occasions</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Expert Staff</h3>
            <p className="text-gray-600">Dedicated team for your comfort</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
            <p className="text-gray-600">Always here to help you</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-12 mb-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600">50+</p>
              <p className="text-gray-600 mt-2">Luxury Rooms</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">10+</p>
              <p className="text-gray-600 mt-2">Event Venues</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">4.8</p>
              <p className="text-gray-600 mt-2">Guest Rating</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready for Your Stay?</h3>
          <p className="text-lg mb-8">Book your perfect room or host your dream event at SkyTop Grand Hotel</p>
          <Link
            to="/auth"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition font-bold text-lg inline-flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2026 SkyTop Grand Hotel, Utawala, Embakasi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
