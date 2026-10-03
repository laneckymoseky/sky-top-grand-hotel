import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getRoomById, createRoomBooking, createPayment, supabase } from '../lib/supabase';
import { Calendar, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    numberOfNights: 0,
    paymentMethod: 'mpesa',
    mpesaPhone: '',
  });

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const result = await getRoomById(roomId);
      if (result.success) setRoom(result.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    
    if (newData.checkInDate && newData.checkOutDate) {
      const checkIn = new Date(newData.checkInDate);
      const checkOut = new Date(newData.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      newData.numberOfNights = Math.max(1, nights);
    }
    
    setFormData(newData);
  };

  const totalPrice = room ? room.price_per_night * formData.numberOfNights : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in first');
      navigate('/auth');
      return;
    }

    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!customer) {
        toast.error('Customer profile not found');
        return;
      }

      const bookingData = {
        customer_id: customer.id,
        room_id: roomId,
        check_in_date: formData.checkInDate,
        check_out_date: formData.checkOutDate,
        number_of_nights: formData.numberOfNights,
        price_per_night: room.price_per_night,
        total_price: totalPrice,
        actual_price: totalPrice,
        number_of_guests: formData.numberOfGuests,
        payment_status: 'pending',
        booking_status: 'confirmed',
      };

      const bookingRes = await createRoomBooking(bookingData);
      if (!bookingRes.success) throw new Error('Booking failed');

      await createPayment({
        customer_id: customer.id,
        booking_type: 'room_booking',
        booking_id: bookingRes.data.id,
        amount: totalPrice,
        payment_method: formData.paymentMethod,
        mpesa_phone: formData.mpesaPhone,
        status: 'pending',
      });

      toast.success('Room booked successfully!');
      navigate('/dashboard/customer');
    } catch (error) {
      toast.error(error.message || 'Booking failed');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!room) return <div className="text-center py-20">Room not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Room {room.room_number}</h1>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Check-in Date</label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleDateChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Check-out Date</label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleDateChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Number of Guests</label>
                <input
                  type="number"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
                  min="1"
                  max={room.capacity}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Number of Nights</label>
                <input
                  type="number"
                  value={formData.numberOfNights}
                  disabled
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total Price</p>
              <p className="text-3xl font-bold text-blue-600">KES {totalPrice.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">KES {room.price_per_night.toLocaleString()}/night × {formData.numberOfNights} nights</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
                <option value="cash">Cash at Hotel</option>
              </select>
            </div>

            {formData.paymentMethod === 'mpesa' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={formData.mpesaPhone}
                  onChange={(e) => setFormData({ ...formData, mpesaPhone: e.target.value })}
                  placeholder="254712345678"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required={formData.paymentMethod === 'mpesa'}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition text-lg"
            >
              Complete Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
