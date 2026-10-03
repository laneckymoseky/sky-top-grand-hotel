import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEventVenues } from '../lib/supabase';
import { Search, Calendar, Users, Music, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const EventsPage = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [minCapacity, setMinCapacity] = useState(0);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const result = await getAllEventVenues();
      if (result.success) {
        setVenues(result.data);
        setFilteredVenues(result.data);
      }
    } catch (error) {
      toast.error('Failed to load event venues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = venues;

    // Search
    if (searchTerm) {
      filtered = filtered.filter((v) =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((v) => v.venue_type === selectedType);
    }

    // Capacity filter
    if (minCapacity > 0) {
      filtered = filtered.filter((v) => v.capacity >= minCapacity);
    }

    setFilteredVenues(filtered);
  }, [searchTerm, selectedType, minCapacity, venues]);

  const venueTypes = [
    { id: 'ballroom', label: 'Ballroom', icon: '🎭' },
    { id: 'conference_hall', label: 'Conference', icon: '📊' },
    { id: 'dining', label: 'Buffet & Dining', icon: '🍽️' },
    { id: 'pool', label: 'Pool', icon: '🏊' },
    { id: 'garden', label: 'Garden', icon: '🌳' },
    { id: 'terrace', label: 'Terrace', icon: '🏛️' },
    { id: 'courtyard', label: 'Courtyard', icon: '🏰' },
    { id: 'outdoor_lawn', label: 'Outdoor Lawn', icon: '🌿' },
  ];

  const venueIcons = {
    ballroom: '🎭',
    conference_hall: '📊',
    dining: '🍽️',
    pool: '🏊',
    garden: '🌳',
    terrace: '🏛️',
    courtyard: '🏰',
    outdoor_lawn: '🌿',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Event Venues & Halls
            </h1>
          </div>
          <p className="text-gray-600">
            Host your perfect event - Weddings, Conferences, Parties & More
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Search Venues
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search venue name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Capacity Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Min. Capacity
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={minCapacity}
                onChange={(e) => setMinCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="Minimum guests"
              />
            </div>
          </div>

          {/* Venue Type Buttons */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Venue Type</label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedType('all')}
                className={`py-2 px-3 rounded-lg font-semibold transition text-sm ${
                  selectedType === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Types
              </button>
              {venueTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`py-2 px-3 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-1 ${
                    selectedType === type.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <p className="text-gray-600">
            Found <span className="font-bold text-purple-600">{filteredVenues.length}</span> venue{
              filteredVenues.length !== 1 ? 's' : ''
            }
          </p>
        </div>

        {/* Venues Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No venues match your criteria</p>
          </div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVenues.map((venue, idx) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/events/${venue.id}`)}
              >
                {/* Venue Image */}
                {venue.image_url ? (
                  <div className="h-56 overflow-hidden">
                    <img
                      src={venue.image_url}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-56 bg-gradient-to-br from-purple-400 to-pink-400 group-hover:from-purple-500 group-hover:to-pink-500 transition flex items-center justify-center text-4xl opacity-80">
                    {venueIcons[venue.venue_type] || '🎉'}
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition">
                    {venue.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {venue.description}
                  </p>

                  {/* Details Grid */}
                  <div className="space-y-3 mb-4 py-4 border-t border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Capacity: <span className="font-bold">{venue.capacity}</span> guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>
                        KES {venue.price_per_hour.toLocaleString()}/hr or{' '}
                        <span className="font-bold">KES {venue.price_per_day.toLocaleString()}/day</span>
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {venue.amenities && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-700 mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(venue.amenities)
                          .slice(0, 3)
                          .map((amenity, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/event-booking/${venue.id}`);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    Book Event
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
