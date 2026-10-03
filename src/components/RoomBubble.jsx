import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Wifi, Coffee, Tv, Wind, Waves, Mountain, DollarSign, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const RoomBubble = ({ room, onBook }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Parse amenities
  const amenities = room.amenities ? JSON.parse(room.amenities) : [];
  
  // Cleanly check availability status once
  const isAvailable = room.status === 'available';

  // Icon mapping for amenities
  const amenityIcons = {
    'WiFi': <Wifi className="w-4 h-4" />,
    'Coffee': <Coffee className="w-4 h-4" />,
    'TV': <Tv className="w-4 h-4" />,
    'AC': <Wind className="w-4 h-4" />,
    'Jacuzzi': <Waves className="w-4 h-4" />,
    'Lake View': <Mountain className="w-4 h-4" />,
  };

  return (
    <motion.div
      layout
      // Only allow hover effects if the room is actually available
      onMouseEnter={() => isAvailable && setIsHovered(true)}
      onMouseLeave={() => isAvailable && setIsHovered(false)}
      whileHover={isAvailable ? { scale: 1.05 } : {}}
      // Apply the grayscale, opacity, and remove mouse interaction for booked rooms here:
      className={`relative ${
        !isAvailable ? 'grayscale opacity-60 pointer-events-none' : ''
      }`}
    >
      {/* Main Bubble - responsive so rooms stay visible on small windows */}
      <div className="relative h-80 w-72 max-w-[85vw] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-50 to-slate-100">

        {/* Room Image (falls back to gradient) */}
        {room.image_url ? (
          <img
            src={room.image_url}
            alt={`Room ${room.room_number}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-80" />
        )}
        
        {/* Readability overlay - dark tint when booked for extra contrast */}
        <div
          className={`absolute inset-0 ${
            !isAvailable
              ? 'bg-black bg-opacity-50'
              : 'bg-black bg-opacity-30'
          }`}
        />

        {/* Booked Marking */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="bg-red-600 text-white text-xl font-bold px-6 py-2 rounded-full rotate-[-8deg] shadow-lg">
              Booked
            </span>
          </div>
        )}
        
        {/* Premium Badge */}
        {room.is_premium && (
          <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Premium
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
            isAvailable ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isAvailable ? 'Available' : 'Booked'}
          </span>
        </div>

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
          
          {/* Top Section */}
          <div>
            <h3 className="text-2xl font-bold mb-1">Room {room.room_number}</h3>
            <p className="text-sm opacity-90">{room.room_type}</p>
            <p className="text-xs opacity-75 mt-2">Floor {room.floor}</p>
          </div>

          {/* Middle Section - Amenities on Hover */}
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-4 bg-black bg-opacity-70 rounded-2xl p-4 overflow-hidden"
            style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          >
            <h4 className="text-sm font-bold mb-3 text-white">Features & Amenities</h4>
            
            {/* Quick Features */}
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-200">
                <Users className="w-4 h-4 text-blue-300" />
                <span>Capacity: {room.capacity} guests</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-200">
                <DollarSign className="w-4 h-4 text-green-300" />
                <span>KES {room.price_per_night?.toLocaleString()}/night</span>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="grid grid-cols-2 gap-2">
              {amenities.slice(0, 4).map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-200 bg-gray-800 rounded px-2 py-1">
                  {amenityIcons[amenity] || <Wifi className="w-3 h-3" />}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>

            {/* View Details Button */}
            <Link
              to={`/rooms/${room.id}`}
              className="mt-4 block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-lg text-xs font-bold transition"
            >
              View Details
            </Link>
          </motion.div>

          {/* Bottom Section - Always Visible */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold">KES {room.price_per_night?.toLocaleString()}</p>
              <p className="text-xs opacity-75">per night</p>
            </div>
            
            {/* Capacity Indicator */}
            <div className="flex items-center gap-1.5 bg-white bg-opacity-20 px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">{room.capacity}</span>
            </div>
          </div>
        </div>

        {/* Book Button - Show on Hover */}
        {isAvailable && (
          <motion.button
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            onClick={onBook}
            className="absolute bottom-6 left-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-full transition shadow-lg"
          >
            Book Now
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default RoomBubble;
