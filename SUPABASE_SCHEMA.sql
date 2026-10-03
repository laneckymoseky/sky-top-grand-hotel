-- ============================================================================
-- PATROBA GRAND HOTEL - SINGLE HOTEL MANAGEMENT SYSTEM
-- Option 2: Single Hotel with Event Booking & Advanced Features
-- ============================================================================

-- ============================================================================
-- HOTEL STAFF (Workers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS hotel_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(100) NOT NULL, -- receptionist, housekeeping, manager, admin
  department VARCHAR(100), -- Front Desk, Housekeeping, Kitchen, Security
  shift VARCHAR(50), -- morning, evening, night
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CUSTOMERS (Hotel Guests)
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  country VARCHAR(100),
  identification_type VARCHAR(50), -- passport, national_id, driver_license
  identification_number VARCHAR(100),
  avatar_url TEXT,
  loyalty_tier VARCHAR(50) DEFAULT 'standard', -- standard, silver, gold, platinum
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ROOMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(50) NOT NULL UNIQUE,
  room_type VARCHAR(100) NOT NULL, -- Standard, Deluxe, Suite, Imperial Suite, Penthouse
  floor INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'available', -- available, booked, maintenance, cleaning, reserved
  is_premium BOOLEAN DEFAULT FALSE, -- Premium room flag for filtering
  amenities TEXT, -- JSON array: WiFi, AC, TV, Balcony, Jacuzzi, Lake View, Food Delivery
  description TEXT,
  features TEXT, -- JSON: detailed room features
  image_url TEXT,
  bathroom_image_url TEXT, -- bathroom photo shown on the room details page
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- If your rooms table already exists, run this once to add the bathroom image column:
-- ALTER TABLE rooms ADD COLUMN IF NOT EXISTS bathroom_image_url TEXT;

-- ============================================================================
-- ROOM BOOKINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS room_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_nights INTEGER NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  discount_applied DECIMAL(10, 2) DEFAULT 0.00,
  actual_price DECIMAL(10, 2) NOT NULL,
  number_of_guests INTEGER NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, refunded
  booking_status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, checked_in, checked_out, cancelled
  payment_method VARCHAR(50), -- mpesa, card, cash
  special_requests TEXT,
  assigned_staff_id UUID REFERENCES hotel_staff(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EVENT VENUES (New Feature!)
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  venue_type VARCHAR(100) NOT NULL, -- ballroom, conference_hall, garden, terrace, courtyard, outdoor_lawn
  capacity INTEGER NOT NULL,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  price_per_day DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'available',
  floor_location VARCHAR(100),
  description TEXT,
  amenities TEXT, -- JSON: microphone, projector, tables, chairs, lighting, sound_system
  features TEXT, -- JSON: detailed venue features
  image_url TEXT,
  is_available_weekends BOOLEAN DEFAULT TRUE,
  is_available_nights BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EVENT BOOKINGS (New Feature!)
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES event_venues(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- wedding, conference, party, seminar, corporate_event, birthday
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  expected_guests INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  discount_applied DECIMAL(10, 2) DEFAULT 0.00,
  actual_price DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, refunded
  booking_status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, setup_complete, event_ongoing, completed, cancelled
  payment_method VARCHAR(50), -- mpesa, card, cash
  special_requests TEXT,
  catering_required BOOLEAN DEFAULT FALSE,
  decoration_required BOOLEAN DEFAULT FALSE,
  photography_required BOOLEAN DEFAULT FALSE,
  assigned_staff_id UUID REFERENCES hotel_staff(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EVENT SERVICES (Catering, Photography, Decoration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  service_type VARCHAR(100) NOT NULL, -- catering, decoration, photography, videography, music, equipment_rental
  description TEXT,
  price_structure VARCHAR(50), -- per_person, per_event, per_hour
  base_price DECIMAL(10, 2) NOT NULL,
  max_capacity INTEGER,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EVENT SERVICE BOOKINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_booking_id UUID NOT NULL REFERENCES event_bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES event_services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_type VARCHAR(50) NOT NULL, -- room_booking, event_booking
  booking_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL, -- mpesa, card, bank_transfer, cash
  transaction_reference VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  mpesa_phone VARCHAR(20),
  mpesa_till_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ROOM CLEANING STATUS (For Housekeeping)
-- ============================================================================
CREATE TABLE IF NOT EXISTS room_cleaning_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  assigned_staff_id UUID REFERENCES hotel_staff(id),
  cleaning_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GUEST REVIEWS & RATINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS guest_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES room_bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  room_cleanliness_rating INTEGER CHECK (room_cleanliness_rating >= 1 AND room_cleanliness_rating <= 5),
  service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
  amenities_rating INTEGER CHECK (amenities_rating >= 1 AND amenities_rating <= 5),
  value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
  overall_rating DECIMAL(3, 2),
  review_text TEXT,
  images_urls TEXT[], -- Array of image URLs
  is_verified_booking BOOLEAN DEFAULT TRUE,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'published', -- published, pending, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DIRECT MESSAGING (Customer Service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES hotel_staff(id),
  booking_id UUID,
  event_booking_id UUID,
  message_text TEXT NOT NULL,
  sender_type VARCHAR(50) NOT NULL, -- customer, staff
  attachment_urls TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GUEST ISSUES & COMPLAINTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS guest_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES room_bookings(id),
  issue_category VARCHAR(100) NOT NULL, -- room_issue, service_issue, billing_issue, safety, cleanliness, other
  issue_title VARCHAR(255) NOT NULL,
  issue_description TEXT NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_staff_id UUID REFERENCES hotel_staff(id),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INCOME REPORTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS income_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  total_room_bookings INTEGER DEFAULT 0,
  total_event_bookings INTEGER DEFAULT 0,
  room_revenue DECIMAL(12, 2) DEFAULT 0.00,
  event_revenue DECIMAL(12, 2) DEFAULT 0.00,
  services_revenue DECIMAL(12, 2) DEFAULT 0.00,
  total_revenue DECIMAL(12, 2) DEFAULT 0.00,
  discounts_given DECIMAL(12, 2) DEFAULT 0.00,
  total_guests INTEGER DEFAULT 0,
  occupancy_rate DECIMAL(5, 2),
  average_room_rate DECIMAL(10, 2),
  most_booked_room_type VARCHAR(100),
  most_booked_room_floor INTEGER,
  cancellation_count INTEGER DEFAULT 0,
  cancellation_rate DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(report_period_start, report_period_end)
);

-- ============================================================================
-- MONTHLY ANALYTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS monthly_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_room_bookings INTEGER DEFAULT 0,
  total_event_bookings INTEGER DEFAULT 0,
  total_guests INTEGER DEFAULT 0,
  room_revenue DECIMAL(12, 2) DEFAULT 0.00,
  event_revenue DECIMAL(12, 2) DEFAULT 0.00,
  average_room_rate DECIMAL(10, 2) DEFAULT 0.00,
  occupancy_rate DECIMAL(5, 2) DEFAULT 0.00,
  cancellation_rate DECIMAL(5, 2) DEFAULT 0.00,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year, month)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Rooms indexes
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_premium ON rooms(is_premium);
CREATE INDEX idx_rooms_type ON rooms(room_type);

-- Room bookings indexes
CREATE INDEX idx_room_bookings_customer ON room_bookings(customer_id);
CREATE INDEX idx_room_bookings_room ON room_bookings(room_id);
CREATE INDEX idx_room_bookings_dates ON room_bookings(check_in_date, check_out_date);
CREATE INDEX idx_room_bookings_status ON room_bookings(booking_status);
CREATE INDEX idx_room_bookings_payment_status ON room_bookings(payment_status);

-- Event bookings indexes
CREATE INDEX idx_event_bookings_customer ON event_bookings(customer_id);
CREATE INDEX idx_event_bookings_venue ON event_bookings(venue_id);
CREATE INDEX idx_event_bookings_date ON event_bookings(event_date);
CREATE INDEX idx_event_bookings_status ON event_bookings(booking_status);
CREATE INDEX idx_event_bookings_payment_status ON event_bookings(payment_status);

-- Payments indexes
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_customer ON messages(customer_id);
CREATE INDEX idx_messages_staff ON messages(staff_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Issues indexes
CREATE INDEX idx_issues_customer ON issues(customer_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_severity ON issues(severity);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Room occupancy overview
CREATE OR REPLACE VIEW room_occupancy_view AS
SELECT 
  r.id,
  r.room_number,
  r.room_type,
  r.status,
  COUNT(DISTINCT CASE WHEN b.booking_status IN ('confirmed', 'checked_in') THEN b.id END) as active_bookings,
  MAX(b.check_out_date) as next_available_date
FROM rooms r
LEFT JOIN room_bookings b ON r.id = b.room_id
GROUP BY r.id, r.room_number, r.room_type, r.status;

-- Revenue overview
CREATE OR REPLACE VIEW revenue_view AS
SELECT 
  DATE_TRUNC('month', p.created_at)::DATE as month,
  SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_revenue,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' AND p.booking_type = 'room_booking' THEN p.id END) as room_bookings,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' AND p.booking_type = 'event_booking' THEN p.id END) as event_bookings
FROM payments p
GROUP BY DATE_TRUNC('month', p.created_at)
ORDER BY month DESC;

-- Staff performance view
CREATE OR REPLACE VIEW staff_performance_view AS
SELECT 
  s.id,
  s.full_name,
  s.role,
  COUNT(DISTINCT b.id) as rooms_managed,
  COUNT(DISTINCT e.id) as events_managed,
  AVG(CASE WHEN r.cleanliness_rating IS NOT NULL THEN r.cleanliness_rating ELSE 0 END) as avg_cleanliness_rating
FROM hotel_staff s
LEFT JOIN room_bookings b ON s.id = b.assigned_staff_id
LEFT JOIN event_bookings e ON s.id = e.assigned_staff_id
LEFT JOIN room_cleaning_log r ON s.id = r.assigned_staff_id
WHERE s.is_active = TRUE
GROUP BY s.id, s.full_name, s.role;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update room status based on bookings
CREATE OR REPLACE FUNCTION update_room_status_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_status IN ('confirmed', 'checked_in') THEN
    UPDATE rooms SET status = 'booked' WHERE id = NEW.room_id;
  ELSIF NEW.booking_status IN ('checked_out', 'cancelled') THEN
    UPDATE rooms SET status = 'available' WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_room_status_update
AFTER INSERT OR UPDATE ON room_bookings
FOR EACH ROW
EXECUTE FUNCTION update_room_status_on_booking();

-- Update venue status based on event bookings
CREATE OR REPLACE FUNCTION update_venue_status_on_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_status IN ('confirmed', 'event_ongoing') THEN
    UPDATE event_venues SET status = 'booked' WHERE id = NEW.venue_id;
  ELSIF NEW.booking_status IN ('completed', 'cancelled') THEN
    UPDATE event_venues SET status = 'available' WHERE id = NEW.venue_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_venue_status_update
AFTER INSERT OR UPDATE ON event_bookings
FOR EACH ROW
EXECUTE FUNCTION update_venue_status_on_event();

-- ============================================================================
-- SAMPLE DATA (Optional - Uncomment to use)
-- NOTE: The app also ships these rooms/venues locally in src/data/hotelData.js,
-- so they appear even if you don't run these inserts. Image paths point to
-- files in the app's /public/images folder.
-- ============================================================================

-- Insert sample rooms (room image + matching bathroom image)
-- INSERT INTO rooms (room_number, room_type, floor, capacity, price_per_night, is_premium, amenities, description, image_url, bathroom_image_url) VALUES
-- ('101', 'Standard Room', 1, 2, 5000, FALSE, '["WiFi", "AC", "TV"]', 'Comfortable standard room', '/images/rooms/regular-1.jpg', '/images/bathrooms/regular-1-bathroom.jpg'),
-- ('104', 'Regular Room', 1, 2, 4500, FALSE, '["WiFi", "TV", "AC", "Coffee"]', 'Comfortable regular room with everything you need for a great stay.', '/images/rooms/regular-1.jpg', '/images/bathrooms/regular-1-bathroom.jpg'),
-- ('105', 'Regular Room', 1, 2, 4500, FALSE, '["WiFi", "TV", "AC", "Coffee"]', 'Comfortable regular room with everything you need for a great stay.', '/images/rooms/regular-2.jpg', '/images/bathrooms/regular-2-bathroom.jpg'),
-- ('106', 'Regular Room', 1, 2, 4800, FALSE, '["WiFi", "TV", "AC", "Coffee"]', 'Bright regular room with a modern bathroom and cozy bedding.', '/images/rooms/regular-3.jpg', '/images/bathrooms/regular-3-bathroom.jpg'),
-- ('107', 'Regular Room', 1, 2, 4800, FALSE, '["WiFi", "TV", "AC", "Coffee"]', 'Bright regular room with a modern bathroom and cozy bedding.', '/images/rooms/regular-4.jpg', '/images/bathrooms/random-bathroom.jpg'),
-- ('108', 'Regular Room', 1, 3, 5200, FALSE, '["WiFi", "TV", "AC", "Coffee"]', 'Spacious regular room, ideal for small families or groups.', '/images/rooms/regular-5.jpg', '/images/bathrooms/regular-1-bathroom.jpg'),
-- ('109', 'Regular Room', 1, 3, 5200, FALSE, '["WiFi", "TV", "AC", "Coffee"]', 'Spacious regular room, ideal for small families or groups.', '/images/rooms/regular-6.jpg', '/images/bathrooms/regular-2-bathroom.jpg'),
-- ('110', 'Regular Room', 1, 3, 5500, FALSE, '["WiFi", "TV", "AC", "Coffee"]', 'Our largest regular room with extra space to unwind.', '/images/rooms/regular-7.jpg', '/images/bathrooms/regular-3-bathroom.jpg'),
-- ('201', 'Deluxe Room', 2, 3, 8000, TRUE, '["WiFi", "AC", "TV", "Balcony", "Lake View"]', 'Deluxe with balcony', '/images/rooms/regular-5.jpg', '/images/bathrooms/random-bathroom.jpg'),
-- ('202', '2 Bed 1 Room', 2, 4, 9000, FALSE, '["WiFi", "TV", "AC", "Coffee", "Two Beds"]', 'Family-friendly room with two comfortable beds in one space.', '/images/rooms/2bed-1room.jpg', '/images/bathrooms/random-bathroom.jpg'),
-- ('203', '2 Bed 1 Room', 2, 4, 9500, FALSE, '["WiFi", "TV", "AC", "Coffee", "Two Beds"]', 'Family-friendly room with two comfortable beds in one space.', '/images/rooms/2bed-1room-2.jpg', '/images/bathrooms/regular-3-bathroom.jpg'),
-- ('301', 'Imperial Suite', 3, 4, 15000, TRUE, '["WiFi", "AC", "TV", "Jacuzzi", "Lake View", "Food Delivery"]', 'Premium imperial suite', '/images/rooms/premium-suite.jpg', '/images/bathrooms/premium-suite-bathroom.jpg'),
-- ('302', 'Premium 2 Bed 1 Room', 3, 4, 14000, TRUE, '["WiFi", "TV", "AC", "Coffee", "Two Beds", "Jacuzzi"]', 'Premium two-bed room with upgraded finishes and a luxury bathroom.', '/images/rooms/premium-2bed-1room.jpg', '/images/bathrooms/premium-2bed-1room-bathroom.jpg'),
-- ('401', 'Premium Suite', 4, 4, 18000, TRUE, '["WiFi", "TV", "AC", "Coffee", "Jacuzzi", "City View"]', 'Elegant premium suite with a luxurious en-suite bathroom.', '/images/rooms/premium-suite.jpg', '/images/bathrooms/premium-suite-bathroom.jpg'),
-- ('402', 'Premium Suite', 4, 4, 19000, TRUE, '["WiFi", "TV", "AC", "Coffee", "Jacuzzi", "City View"]', 'Elegant premium suite with a luxurious en-suite bathroom.', '/images/rooms/premium-suite-1.jpg', '/images/bathrooms/premium-suite-1-bathroom.jpg'),
-- ('403', 'Premium Suite', 4, 4, 20000, TRUE, '["WiFi", "TV", "AC", "Coffee", "Jacuzzi", "City View"]', 'Elegant premium suite with a luxurious en-suite bathroom.', '/images/rooms/premium-suite-2.jpg', '/images/bathrooms/premium-suite-2-bathroom.jpg'),
-- ('404', 'Premium Suite', 4, 4, 22000, TRUE, '["WiFi", "TV", "AC", "Coffee", "Jacuzzi", "City View"]', 'Our flagship premium suite - the finest stay at SkyTop Grand Hotel.', '/images/rooms/premium-suite-3.jpg', '/images/bathrooms/premium-suite-3-bathroom.jpg');

-- Insert sample event venues (halls, buffet, pools, outdoors)
-- INSERT INTO event_venues (name, venue_type, capacity, price_per_hour, price_per_day, description, amenities, image_url) VALUES
-- ('Grand Ballroom', 'ballroom', 500, 10000, 50000, 'Spacious ballroom for weddings', '["Microphone", "Projector", "Sound System"]', '/images/events/hall.jpg'),
-- ('Garden Terrace', 'garden', 200, 5000, 25000, 'Beautiful outdoor garden venue', '["Tables", "Chairs", "Lighting"]', '/images/events/outdoors.jpg'),
-- ('Grand Celebration Hall', 'ballroom', 300, 12000, 60000, 'A grand hall perfect for weddings, galas and large celebrations.', '["Stage", "Sound System", "Lighting", "AC"]', '/images/events/hall.jpg'),
-- ('Crystal Banquet Hall', 'ballroom', 250, 10000, 50000, 'Elegant banquet hall for dinners, receptions and corporate events.', '["Stage", "Sound System", "Catering Ready", "AC"]', '/images/events/hall-2.jpg'),
-- ('Skyview Hall', 'conference_hall', 150, 8000, 40000, 'Modern hall ideal for conferences, seminars and workshops.', '["Projector", "Sound System", "WiFi", "AC"]', '/images/events/hall-3.jpg'),
-- ('Emerald Hall', 'conference_hall', 120, 7000, 35000, 'A versatile hall for meetings, trainings and private functions.', '["Projector", "WiFi", "Whiteboard", "AC"]', '/images/events/hall-4.jpg'),
-- ('The Grand Buffet', 'dining', 200, 6000, 30000, 'Our signature buffet experience for parties and celebrations.', '["Full Catering", "Buffet Stations", "Bar", "AC"]', '/images/events/buffet.jpg'),
-- ('SkyTop Buffet Lounge', 'dining', 120, 5000, 25000, 'A relaxed buffet lounge for intimate gatherings and family events.', '["Full Catering", "Buffet Stations", "Lounge Seating", "AC"]', '/images/events/buffet-2.jpg'),
-- ('Rooftop Pool Deck', 'pool', 80, 6000, 30000, 'Poolside venue with stunning views - perfect for day parties.', '["Pool", "Sun Loungers", "Bar Service", "Towels"]', '/images/events/pool-1.jpg'),
-- ('Garden Poolside', 'pool', 60, 5000, 25000, 'A serene poolside setting for relaxed events and pool parties.', '["Pool", "Sun Loungers", "Changing Rooms", "Towels"]', '/images/events/pool-2.jpg'),
-- ('Basement Indoor Pool', 'pool', 50, 4000, 20000, 'Private indoor pool area, great for swims and small events all year round.', '["Indoor Pool", "Heated Water", "Changing Rooms", "Towels"]', '/images/events/basement-pool.jpg'),
-- ('Garden Lawn', 'garden', 200, 6000, 30000, 'Lush garden lawn for outdoor weddings and celebrations.', '["Open Air", "Tent Ready", "Parking", "Power Supply"]', '/images/events/outdoors.jpg'),
-- ('Sunset Gardens', 'garden', 150, 5500, 28000, 'Beautiful gardens that glow at sunset - magical for evening events.', '["Open Air", "Tent Ready", "Garden Lights", "Parking"]', '/images/events/outdoors-2.jpg'),
-- ('Courtyard Gardens', 'courtyard', 100, 4500, 22000, 'Charming courtyard gardens for intimate outdoor gatherings.', '["Open Air", "Sheltered Areas", "Garden Lights", "Power Supply"]', '/images/events/outdoors-3.jpg'),
-- ('Riverside Outdoor Lawn', 'outdoor_lawn', 250, 7000, 35000, 'Expansive outdoor lawn with scenic views for big outdoor events.', '["Open Air", "Tent Ready", "Parking", "Scenic Views"]', '/images/events/outdoors-4.jpg');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
