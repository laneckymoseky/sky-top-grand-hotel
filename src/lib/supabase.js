import { createClient } from '@supabase/supabase-js';
import {
  localRooms,
  localVenues,
  roomImageFor,
  bathroomImageFor,
  venueImageFor,
} from '../data/hotelData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Merge database rows with the local hotel data (src/data/hotelData.js) so the
// new rooms/venues always appear and every listing has an image.
const withRoomImages = (room) => ({
  ...room,
  image_url: roomImageFor(room),
  bathroom_image_url: bathroomImageFor(room),
});

const mergeRooms = (dbRooms = []) => {
  const dbNumbers = new Set(dbRooms.map((r) => String(r.room_number)));
  const extras = localRooms.filter((r) => !dbNumbers.has(String(r.room_number)));
  return [...dbRooms.map(withRoomImages), ...extras];
};

const withVenueImage = (venue) => ({ ...venue, image_url: venueImageFor(venue) });

const mergeVenues = (dbVenues = []) => {
  const dbNames = new Set(dbVenues.map((v) => (v.name || '').toLowerCase()));
  const extras = localVenues.filter((v) => !dbNames.has(v.name.toLowerCase()));
  return [...dbVenues.map(withVenueImage), ...extras];
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const signUpCustomer = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer',
        },
      },
    });
    
    if (error) throw error;
    
    const { error: profileError } = await supabase
      .from('customers')
      .insert([
        {
          auth_id: data.user.id,
          email,
          full_name: fullName,
        },
      ]);
    
    if (profileError) throw profileError;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signUpStaff = async (email, password, fullName, role, department) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'staff',
          staff_role: role,
        },
      },
    });
    
    if (error) throw error;
    
    const { error: staffError } = await supabase
      .from('hotel_staff')
      .insert([
        {
          auth_id: data.user.id,
          email,
          full_name: fullName,
          role,
          department,
        },
      ]);
    
    if (staffError) throw staffError;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    return null;
  }
};

// ============================================================================
// ROOMS
// ============================================================================

export const getAllRooms = async () => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number');

    if (error) throw error;
    return { success: true, data: mergeRooms(data) };
  } catch (error) {
    // Database unreachable - still show the local rooms
    return { success: true, data: mergeRooms([]) };
  }
};

export const getPremiumRooms = async () => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_premium', true)
      .eq('status', 'available')
      .order('price_per_night', { ascending: false });

    if (error) throw error;
    return {
      success: true,
      data: mergeRooms(data).filter((r) => r.is_premium && r.status === 'available'),
    };
  } catch (error) {
    return {
      success: true,
      data: mergeRooms([]).filter((r) => r.is_premium && r.status === 'available'),
    };
  }
};

export const getAvailableRooms = async (checkInDate, checkOutDate, capacity = null) => {
  try {
    let query = supabase
      .from('rooms')
      .select('*')
      .eq('status', 'available');

    if (capacity) {
      query = query.gte('capacity', capacity);
    }

    const { data, error } = await query.order('price_per_night');

    if (error) throw error;
    let merged = mergeRooms(data).filter((r) => r.status === 'available');
    if (capacity) merged = merged.filter((r) => r.capacity >= capacity);
    return { success: true, data: merged };
  } catch (error) {
    let local = mergeRooms([]).filter((r) => r.status === 'available');
    if (capacity) local = local.filter((r) => r.capacity >= capacity);
    return { success: true, data: local };
  }
};

export const getRoomById = async (roomId) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) throw error;
    return { success: true, data: withRoomImages(data) };
  } catch (error) {
    const local = localRooms.find((r) => String(r.id) === String(roomId));
    if (local) return { success: true, data: withRoomImages(local) };
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ROOM BOOKINGS
// ============================================================================

export const createRoomBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('room_bookings')
      .insert([bookingData])
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCustomerRoomBookings = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('room_bookings')
      .select('*, rooms(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllRoomBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('room_bookings')
      .select('*, customers(*), rooms(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateRoomBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('room_bookings')
      .update({ booking_status: status })
      .eq('id', bookingId)
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================================
// EVENT VENUES
// ============================================================================

export const getAllEventVenues = async () => {
  try {
    const { data, error } = await supabase
      .from('event_venues')
      .select('*')
      .eq('status', 'available')
      .order('name');

    if (error) throw error;
    return {
      success: true,
      data: mergeVenues(data).filter((v) => v.status === 'available'),
    };
  } catch (error) {
    return { success: true, data: mergeVenues([]) };
  }
};

export const getEventVenueById = async (venueId) => {
  try {
    const { data, error } = await supabase
      .from('event_venues')
      .select('*')
      .eq('id', venueId)
      .single();

    if (error) throw error;
    return { success: true, data: withVenueImage(data) };
  } catch (error) {
    const local = localVenues.find((v) => String(v.id) === String(venueId));
    if (local) return { success: true, data: withVenueImage(local) };
    return { success: false, error: error.message };
  }
};

// ============================================================================
// EVENT BOOKINGS (NEW FEATURE!)
// ============================================================================

export const createEventBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('event_bookings')
      .insert([bookingData])
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCustomerEventBookings = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('event_bookings')
      .select('*, event_venues(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllEventBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('event_bookings')
      .select('*, customers(*), event_venues(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateEventBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('event_bookings')
      .update({ booking_status: status })
      .eq('id', bookingId)
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================================
// EVENT SERVICES
// ============================================================================

export const getAllEventServices = async () => {
  try {
    const { data, error } = await supabase
      .from('event_services')
      .select('*')
      .eq('is_available', true);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================================
// PAYMENTS
// ============================================================================

export const createPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getPaymentsByCustomer = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================================
// REVIEWS
// ============================================================================

export const createReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('guest_reviews')
      .insert([reviewData])
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllReviews = async () => {
  try {
    const { data, error } = await supabase
      .from('guest_reviews')
      .select('*, customers(full_name, avatar_url)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================================
// MESSAGES
// ============================================================================

export const sendMessage = async (messageData) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getConversation = async (customerId, staffId = null) => {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('customer_id', customerId);

    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ISSUES
// ============================================================================

export const createIssue = async (issueData) => {
  try {
    const { data, error } = await supabase
      .from('guest_issues')
      .insert([issueData])
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCustomerIssues = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('guest_issues')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllIssues = async () => {
  try {
    const { data, error } = await supabase
      .from('guest_issues')
      .select('*, customers(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ANALYTICS
// ============================================================================

export const getIncomeReports = async () => {
  try {
    const { data, error } = await supabase
      .from('income_reports')
      .select('*')
      .order('report_period_start', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMonthlyAnalytics = async () => {
  try {
    const { data, error } = await supabase
      .from('monthly_analytics')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(12);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// ============================================================================
// STAFF DASHBOARD HELPERS
// ============================================================================

export const getStaffByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('hotel_staff')
      .select('*')
      .eq('email', email)
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllStaff = async () => {
  try {
    const { data, error } = await supabase
      .from('hotel_staff')
      .select('*')
      .order('full_name');
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAssignedRoomBookings = async (staffId) => {
  try {
    const { data, error } = await supabase
      .from('room_bookings')
      .select('*, customers(full_name, phone), rooms(room_number, room_type, floor)')
      .eq('assigned_staff_id', staffId)
      .order('check_in_date', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAssignedEventBookings = async (staffId) => {
  try {
    const { data, error } = await supabase
      .from('event_bookings')
      .select('*, customers(full_name, phone), event_venues(name, venue_type)')
      .eq('assigned_staff_id', staffId)
      .order('event_date', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAssignedIssues = async (staffId) => {
  try {
    const { data, error } = await supabase
      .from('guest_issues')
      .select('*, customers(full_name, phone)')
      .eq('assigned_staff_id', staffId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateIssueStatus = async (issueId, status, resolutionNotes = null) => {
  try {
    const patch = { status, resolution_notes: resolutionNotes };
    if (status === 'resolved' || status === 'closed') {
      patch.resolved_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('guest_issues')
      .update(patch)
      .eq('id', issueId)
      .select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================================
// STAFF MESSAGING
// ============================================================================

export const getAllConversations = async () => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, customers(full_name)')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const markCustomerMessagesRead = async (customerId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('customer_id', customerId)
      .eq('sender_type', 'customer');
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================================================
// HOUSEKEEPING / ROOM CLEANING
// ============================================================================

export const getRoomCleaningLogs = async (staffId = null) => {
  try {
    let query = supabase
      .from('room_cleaning_log')
      .select('*, rooms(room_number, room_type)')
      .order('cleaning_date', { ascending: false });
    if (staffId) query = query.eq('assigned_staff_id', staffId);
    const { data, error } = await query.limit(100);
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createCleaningLog = async (logData) => {
  try {
    const { data, error } = await supabase
      .from('room_cleaning_log')
      .insert([logData])
      .select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateRoomStatus = async (roomId, status) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update({ status })
      .eq('id', roomId)
      .select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};