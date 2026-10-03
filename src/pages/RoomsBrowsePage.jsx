import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRooms, getPremiumRooms } from '../lib/supabase';
import RoomBubble from '../components/RoomBubble';
import { Search, Filter, Crown, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const RoomsBrowsePage = () => {
  const navigate = useNavigate();
  const [allRooms, setAllRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, premium, budget
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedCapacity, setSelectedCapacity] = useState('all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const result = await getAllRooms();
      if (result.success) {
        setAllRooms(result.data);
        setFilteredRooms(result.data);
      }
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = allRooms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((room) =>
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.room_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Premium filter
    if (showPremiumOnly) {
      filtered = filtered.filter((room) => room.is_premium);
    }

    // Price range filter
    filtered = filtered.filter(
      (room) => room.price_per_night >= priceRange[0] && room.price_per_night <= priceRange[1]
    );

    // Capacity filter
    if (selectedCapacity !== 'all') {
      filtered = filtered.filter((room) => room.capacity === parseInt(selectedCapacity));
    }

    // Floor filter
    if (selectedFloor !== 'all') {
      filtered = filtered.filter((room) => room.floor === parseInt(selectedFloor));
    }

    // Room type filter
    if (filterType === 'premium') {
      filtered = filtered.filter((room) => room.is_premium);
    } else if (filterType === 'budget') {
      filtered = filtered.filter((room) => room.price_per_night < 7000);
    }

    setFilteredRooms(filtered);
  }, [searchTerm, filterType, priceRange, selectedCapacity, selectedFloor, showPremiumOnly, allRooms]);

  const handleBookRoom = (roomId) => {
    navigate(`/booking/${roomId}`);
  };

  const uniqueFloors = [...new Set(allRooms.map((r) => r.floor))].sort();
  const premiumRoomCount = allRooms.filter((r) => r.is_premium).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">
            ✨ SkyTop Grand Hotel Rooms
          </h1>
          <p className="text-sm text-gray-500 mb-3">Utawala, Embakasi</p>
          <p className="text-gray-600">Discover our luxurious rooms and suites</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {/* Search */}
          <div className="md:col-span-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by room number or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Filter Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Room Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Rooms</option>
              <option value="premium">Premium Only</option>
              <option value="budget">Budget Friendly</option>
            </select>
          </div>

          {/* Capacity Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Guest Capacity</label>
            <select
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Any Capacity</option>
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Floor</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Floors</option>
              {uniqueFloors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price Range</label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-center">
                KES {priceRange[0].toLocaleString()} - KES {priceRange[1].toLocaleString()}
              </div>
            </div>
          </div>

          {/* Premium Toggle */}
          <div className="flex items-end">
            <button
              onClick={() => setShowPremiumOnly(!showPremiumOnly)}
              className={`w-full py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                showPremiumOnly
                  ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Crown className="w-4 h-4" />
              Premium Only
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-gray-600">
              Showing <span className="font-bold">{filteredRooms.length}</span> of{' '}
              <span className="font-bold">{allRooms.length}</span> rooms
            </p>
            {premiumRoomCount > 0 && (
              <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                <Crown className="w-4 h-4" />
                {premiumRoomCount} Premium room{premiumRoomCount !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
        </div>

        {/* Rooms Grid - Bubble View */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No rooms match your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setShowPremiumOnly(false);
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center"
          >
            {filteredRooms.map((room, idx) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex justify-center w-full"
              >
                <RoomBubble
                  room={room}
                  onBook={() => handleBookRoom(room.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoomsBrowsePage;
