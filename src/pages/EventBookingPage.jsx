import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getEventVenueById, createEventBooking, createPayment, getAllEventServices } from '../lib/supabase';
import { Calendar, Users, Utensils, Camera, Sparkles, Clock, MapPin, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const EventBookingPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();

  const [venue, setVenue] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [formData, setFormData] = useState({
    eventType: 'wedding',
    eventDate: '',
    startTime: '09:00',
    endTime: '17:00',
    expectedGuests: 100,
    specialRequests: '',
    paymentMethod: 'mpesa',
    mpesaPhone: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const eventTypes = [
    'Wedding',
    'Conference',
    'Birthday Party',
    'Corporate Event',
    'Seminar',
    'Product Launch',
    'Wedding Reception',
    'Gala Dinner',
  ];

  useEffect(() => {
    fetchData();
  }, [venueId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [venueRes, servicesRes] = await Promise.all([
        getEventVenueById(venueId),
        getAllEventServices(),
      ]);

      if (venueRes.success) setVenue(venueRes.data);
      if (servicesRes.success) setServices(servicesRes.data);
    } catch (error) {
      toast.error('Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateDurationHours = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    return Math.max(1, (endMins - startMins) / 60);
  };

  const calculateTotal = () => {
    if (!venue) return { venuePrice: 0, servicesPrice: 0, total: 0 };

    const durationHours = calculateDurationHours();
    const venuePrice = venue.price_per_hour * durationHours;

    const servicesPrice = selectedServices.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      if (!service) return sum;

      // Calculate service price based on structure
      let price = service.base_price;
      if (service.price_structure === 'per_person') {
        price = service.base_price * formData.expectedGuests;
      }
      return sum + price;
    }, 0);

    const total = venuePrice + servicesPrice;
    return { venuePrice, servicesPrice, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.eventDate) {
      toast.error('Please select an event date');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsProcessing(true);
    try {
      const { total } = calculateTotal();
      const durationHours = calculateDurationHours();

      // Get customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!customer) {
        toast.error('Customer profile not found');
        setIsProcessing(false);
        return;
      }

      // Create event booking
      const bookingData = {
        customer_id: customer.id,
        venue_id: venueId,
        event_type: formData.eventType.toLowerCase(),
        event_date: formData.eventDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        duration_hours: Math.ceil(durationHours),
        expected_guests: parseInt(formData.expectedGuests),
        total_price: calculateTotal().venuePrice + calculateTotal().servicesPrice,
        actual_price: total,
        special_requests: formData.specialRequests,
        payment_status: 'pending',
        booking_status: 'confirmed',
        catering_required: selectedServices.some(
          (id) => services.find((s) => s.id === id)?.service_type === 'catering'
        ),
        decoration_required: selectedServices.some(
          (id) => services.find((s) => s.id === id)?.service_type === 'decoration'
        ),
        photography_required: selectedServices.some(
          (id) => services.find((s) => s.id === id)?.service_type === 'photography'
        ),
      };

      const bookingRes = await createEventBooking(bookingData);
      if (!bookingRes.success) throw new Error('Booking failed');

      // Create payment record
      const paymentData = {
        customer_id: customer.id,
        booking_type: 'event_booking',
        booking_id: bookingRes.data.id,
        amount: total,
        payment_method: formData.paymentMethod,
        mpesa_phone: formData.mpesaPhone,
        status: 'pending',
      };

      const paymentRes = await createPayment(paymentData);
      if (!paymentRes.success) throw new Error('Payment creation failed');

      toast.success('Event booking created! Proceeding to payment...');
      navigate(`/dashboard/customer`);
    } catch (error) {
      toast.error(error.message || 'Booking failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!venue) return <div className="text-center py-20">Venue not found</div>;

  const { venuePrice, servicesPrice, total } = calculateTotal();
  const durationHours = calculateDurationHours();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Book Your Event</h1>
          <p className="text-gray-600">{venue.name}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Details */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Event Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Event Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    >
                      {eventTypes.map((type) => (
                        <option key={type} value={type.toLowerCase()}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Expected Guests */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Expected Guests
                    </label>
                    <input
                      type="number"
                      name="expectedGuests"
                      value={formData.expectedGuests}
                      onChange={handleFormChange}
                      min="1"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleFormChange}
                    rows="4"
                    placeholder="Tell us about your special requirements..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Add-on Services */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Utensils className="w-6 h-6 text-purple-600" />
                  Add-on Services
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-600 transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="w-5 h-5 text-purple-600"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-bold text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <p className="text-sm font-bold text-purple-600 mt-1">
                          KES {service.base_price.toLocaleString()}
                          {service.price_structure === 'per_person' && '/person'}
                          {service.price_structure === 'per_hour' && '/hour'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-purple-600 rounded-lg">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={formData.paymentMethod === 'mpesa'}
                      onChange={handleFormChange}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="ml-3 font-bold">M-Pesa</span>
                  </label>

                  {formData.paymentMethod === 'mpesa' && (
                    <input
                      type="tel"
                      name="mpesaPhone"
                      value={formData.mpesaPhone}
                      onChange={handleFormChange}
                      placeholder="Enter M-Pesa phone number"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-lg transition text-lg"
              >
                {isProcessing ? 'Processing...' : `Book Event - KES ${total.toLocaleString()}`}
              </button>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8 sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Booking Summary</h3>

              {/* Venue Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Venue</p>
                <p className="text-lg font-bold text-gray-900">{venue.name}</p>
              </div>

              {/* Duration */}
              {durationHours > 0 && (
                <div className="mb-4 flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span>{durationHours} hour{durationHours !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Guests */}
              <div className="mb-4 flex items-center gap-2 text-gray-700">
                <Users className="w-5 h-5 text-purple-600" />
                <span>{formData.expectedGuests} guests</span>
              </div>

              {/* Venue Price */}
              <div className="mb-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-700 mb-2">
                  <span>Venue ({durationHours}h)</span>
                  <span>KES {venuePrice.toLocaleString()}</span>
                </div>

                {servicesPrice > 0 && (
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Services</span>
                    <span>KES {servicesPrice.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg text-gray-900 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-purple-600">KES {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Venue Details */}
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600">Capacity:</p>
                  <p className="font-bold">{venue.capacity} guests</p>
                </div>

                {venue.amenities && (
                  <div className="text-sm">
                    <p className="text-gray-600 mb-2">Amenities:</p>
                    <div className="space-y-1">
                      {JSON.parse(venue.amenities).map((amenity, idx) => (
                        <p key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          ✓ {amenity}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBookingPage;
