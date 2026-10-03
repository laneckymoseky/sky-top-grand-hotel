import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventVenueById } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

const EventDetailPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVenue();
  }, [venueId]);

  const fetchVenue = async () => {
    try {
      const result = await getEventVenueById(venueId);
      if (result.success) setVenue(result.data);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!venue) return <div className="text-center py-20">Venue not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/events')} className="text-blue-600 hover:text-blue-700 mb-6">
          ← Back to Events
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Venue Image */}
          {venue.image_url ? (
            <div className="h-96">
              <img
                src={venue.image_url}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-96 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-6xl">
              🎉
            </div>
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{venue.name}</h1>
            <p className="text-gray-600 mb-8">{venue.description}</p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Details</h3>
                <div className="space-y-3">
                  <p><strong>Capacity:</strong> {venue.capacity} guests</p>
                  <p><strong>Per Hour:</strong> KES {venue.price_per_hour.toLocaleString()}</p>
                  <p><strong>Per Day:</strong> KES {venue.price_per_day.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/event-booking/${venue.id}`)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition text-lg"
            >
              Book This Venue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
