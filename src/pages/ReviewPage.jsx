import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createReview } from '../lib/supabase';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({
    cleanliness: 0,
    service: 0,
    amenities: 0,
    value: 0,
  });
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const overall = (ratings.cleanliness + ratings.service + ratings.amenities + ratings.value) / 4;

    try {
      const result = await createReview({
        booking_id: bookingId,
        room_cleanliness_rating: ratings.cleanliness,
        service_quality_rating: ratings.service,
        amenities_rating: ratings.amenities,
        value_for_money_rating: ratings.value,
        overall_rating: overall,
        review_text: reviewText,
      });

      if (result.success) {
        toast.success('Review submitted!');
        navigate('/dashboard/customer');
      }
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const StarRating = ({ label, value, onChange }) => (
    <div className="flex items-center gap-4">
      <label className="text-gray-700 font-bold w-32">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`p-2 ${value >= num ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Leave a Review</h1>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-6">Rate Your Experience</h3>
              <div className="space-y-4">
                <StarRating
                  label="Room Cleanliness"
                  value={ratings.cleanliness}
                  onChange={(val) => setRatings({ ...ratings, cleanliness: val })}
                />
                <StarRating
                  label="Service Quality"
                  value={ratings.service}
                  onChange={(val) => setRatings({ ...ratings, service: val })}
                />
                <StarRating
                  label="Amenities"
                  value={ratings.amenities}
                  onChange={(val) => setRatings({ ...ratings, amenities: val })}
                />
                <StarRating
                  label="Value for Money"
                  value={ratings.value}
                  onChange={(val) => setRatings({ ...ratings, value: val })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="6"
                placeholder="Tell us about your experience..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition text-lg"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
