import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById } from '../lib/supabase';
import { Star, Users, DollarSign, Wifi, Wind, Waves } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const RoomDetailPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const result = await getRoomById(roomId);
      if (result.success) setRoom(result.data);
    } catch (error) {
      console.error('Failed to load room');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!room) return <div className="text-center py-20">Room not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/rooms')} className="text-blue-600 hover:text-blue-700 mb-6">
          ← Back to Rooms
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Room Image */}
          {room.image_url ? (
            <div className="relative h-96">
              <img
                src={room.image_url}
                alt={`Room ${room.room_number}`}
                className="w-full h-full object-cover"
              />
              {room.status !== 'available' && (
                <div className="absolute inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center">
                  <span className="bg-red-600 text-white text-2xl font-bold px-8 py-3 rounded-full">
                    Booked
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-6xl">
              🛏️
            </div>
          )}

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Room {room.room_number} - {room.room_type}
                </h1>
                <p className="text-gray-600">Floor {room.floor}</p>
              </div>
              {room.is_premium && (
                <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold">
                  ⭐ Premium
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Capacity: {room.capacity} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span>KES {room.price_per_night.toLocaleString()}/night</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      room.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.status === 'available' ? '✓ Available' : '✗ Booked'}
                    </span>
                  </div>
                </div>
              </div>

              {room.amenities && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Amenities</h3>
                  <div className="space-y-2">
                    {JSON.parse(room.amenities).map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {room.description && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">Description</h3>
                <p className="text-gray-700">{room.description}</p>
              </div>
            )}

            {/* Bathroom */}
            {room.bathroom_image_url && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Bathroom</h3>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <img
                    src={room.bathroom_image_url}
                    alt={`Room ${room.room_number} bathroom`}
                    className="w-full h-80 object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => navigate(`/booking/${room.id}`)}
              disabled={room.status !== 'available'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition text-lg"
            >
              {room.status === 'available' ? 'Book This Room' : 'Not Available'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
