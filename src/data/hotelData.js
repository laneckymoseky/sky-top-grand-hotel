// ============================================================================
// SkyTop Grand Hotel - Local Hotel Data
// ----------------------------------------------------------------------------
// New rooms and event venues (with images) live here so they always show up,
// even before they are added to the Supabase database. The getters in
// lib/supabase.js merge these with whatever comes back from the database.
// Image paths live in /public/images/...
// ============================================================================

const img = (p) => `/images/${p}`;

// ----------------------------------------------------------------------------
// NEW ROOMS (each with its matching bathroom image)
// ----------------------------------------------------------------------------

export const localRooms = [
  // --- Regular Rooms (Floor 1) ---
  {
    id: 'local-room-104', room_number: '104', room_type: 'Regular Room', floor: 1,
    capacity: 2, price_per_night: 4500, is_premium: false, status: 'available',
    image_url: img('rooms/regular-1.jpg'), bathroom_image_url: img('bathrooms/regular-1-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee']),
    description: 'Comfortable regular room with everything you need for a great stay.',
  },
  {
    id: 'local-room-105', room_number: '105', room_type: 'Regular Room', floor: 1,
    capacity: 2, price_per_night: 4500, is_premium: false, status: 'available',
    image_url: img('rooms/regular-2.jpg'), bathroom_image_url: img('bathrooms/regular-2-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee']),
    description: 'Comfortable regular room with everything you need for a great stay.',
  },
  {
    id: 'local-room-106', room_number: '106', room_type: 'Regular Room', floor: 1,
    capacity: 2, price_per_night: 4800, is_premium: false, status: 'available',
    image_url: img('rooms/regular-3.jpg'), bathroom_image_url: img('bathrooms/regular-3-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee']),
    description: 'Bright regular room with a modern bathroom and cozy bedding.',
  },
  {
    id: 'local-room-107', room_number: '107', room_type: 'Regular Room', floor: 1,
    capacity: 2, price_per_night: 4800, is_premium: false, status: 'available',
    image_url: img('rooms/regular-4.jpg'), bathroom_image_url: img('bathrooms/random-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee']),
    description: 'Bright regular room with a modern bathroom and cozy bedding.',
  },
  {
    id: 'local-room-108', room_number: '108', room_type: 'Regular Room', floor: 1,
    capacity: 3, price_per_night: 5200, is_premium: false, status: 'available',
    image_url: img('rooms/regular-5.jpg'), bathroom_image_url: img('bathrooms/regular-1-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee']),
    description: 'Spacious regular room, ideal for small families or groups.',
  },
  {
    id: 'local-room-109', room_number: '109', room_type: 'Regular Room', floor: 1,
    capacity: 3, price_per_night: 5200, is_premium: false, status: 'available',
    image_url: img('rooms/regular-6.jpg'), bathroom_image_url: img('bathrooms/regular-2-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee']),
    description: 'Spacious regular room, ideal for small families or groups.',
  },
  {
    id: 'local-room-110', room_number: '110', room_type: 'Regular Room', floor: 1,
    capacity: 3, price_per_night: 5500, is_premium: false, status: 'available',
    image_url: img('rooms/regular-7.jpg'), bathroom_image_url: img('bathrooms/regular-3-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee']),
    description: 'Our largest regular room with extra space to unwind.',
  },

  // --- 2 Bed 1 Room (Floor 2) ---
  {
    id: 'local-room-202', room_number: '202', room_type: '2 Bed 1 Room', floor: 2,
    capacity: 4, price_per_night: 9000, is_premium: false, status: 'available',
    image_url: img('rooms/2bed-1room.jpg'), bathroom_image_url: img('bathrooms/random-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee', 'Two Beds']),
    description: 'Family-friendly room with two comfortable beds in one space.',
  },
  {
    id: 'local-room-203', room_number: '203', room_type: '2 Bed 1 Room', floor: 2,
    capacity: 4, price_per_night: 9500, is_premium: false, status: 'available',
    image_url: img('rooms/2bed-1room-2.jpg'), bathroom_image_url: img('bathrooms/regular-3-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee', 'Two Beds']),
    description: 'Family-friendly room with two comfortable beds in one space.',
  },

  // --- Premium 2 Bed 1 Room (Floor 3) ---
  {
    id: 'local-room-302', room_number: '302', room_type: 'Premium 2 Bed 1 Room', floor: 3,
    capacity: 4, price_per_night: 14000, is_premium: true, status: 'available',
    image_url: img('rooms/premium-2bed-1room.jpg'), bathroom_image_url: img('bathrooms/premium-2bed-1room-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee', 'Two Beds', 'Jacuzzi']),
    description: 'Premium two-bed room with upgraded finishes and a luxury bathroom.',
  },

  // --- Premium Suites (Floor 4) ---
  {
    id: 'local-room-401', room_number: '401', room_type: 'Premium Suite', floor: 4,
    capacity: 4, price_per_night: 18000, is_premium: true, status: 'available',
    image_url: img('rooms/premium-suite.jpg'), bathroom_image_url: img('bathrooms/premium-suite-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee', 'Jacuzzi', 'City View']),
    description: 'Elegant premium suite with a luxurious en-suite bathroom.',
  },
  {
    id: 'local-room-402', room_number: '402', room_type: 'Premium Suite', floor: 4,
    capacity: 4, price_per_night: 19000, is_premium: true, status: 'available',
    image_url: img('rooms/premium-suite-1.jpg'), bathroom_image_url: img('bathrooms/premium-suite-1-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee', 'Jacuzzi', 'City View']),
    description: 'Elegant premium suite with a luxurious en-suite bathroom.',
  },
  {
    id: 'local-room-403', room_number: '403', room_type: 'Premium Suite', floor: 4,
    capacity: 4, price_per_night: 20000, is_premium: true, status: 'available',
    image_url: img('rooms/premium-suite-2.jpg'), bathroom_image_url: img('bathrooms/premium-suite-2-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee', 'Jacuzzi', 'City View']),
    description: 'Elegant premium suite with a luxurious en-suite bathroom.',
  },
  {
    id: 'local-room-404', room_number: '404', room_type: 'Premium Suite', floor: 4,
    capacity: 4, price_per_night: 22000, is_premium: true, status: 'available',
    image_url: img('rooms/premium-suite-3.jpg'), bathroom_image_url: img('bathrooms/premium-suite-3-bathroom.jpg'),
    amenities: JSON.stringify(['WiFi', 'TV', 'AC', 'Coffee', 'Jacuzzi', 'City View']),
    description: 'Our flagship premium suite - the finest stay at SkyTop Grand Hotel.',
  },
];

// ----------------------------------------------------------------------------
// NEW EVENT VENUES (everything that is not a room or a bathroom)
// ----------------------------------------------------------------------------

export const localVenues = [
  // --- Halls ---
  {
    id: 'local-venue-grand-hall', name: 'Grand Celebration Hall', venue_type: 'ballroom',
    capacity: 300, price_per_hour: 12000, price_per_day: 60000, status: 'available',
    image_url: img('events/hall.jpg'),
    amenities: JSON.stringify(['Stage', 'Sound System', 'Lighting', 'AC']),
    description: 'A grand hall perfect for weddings, galas and large celebrations.',
  },
  {
    id: 'local-venue-crystal-hall', name: 'Crystal Banquet Hall', venue_type: 'ballroom',
    capacity: 250, price_per_hour: 10000, price_per_day: 50000, status: 'available',
    image_url: img('events/hall-2.jpg'),
    amenities: JSON.stringify(['Stage', 'Sound System', 'Catering Ready', 'AC']),
    description: 'Elegant banquet hall for dinners, receptions and corporate events.',
  },
  {
    id: 'local-venue-skyview-hall', name: 'Skyview Hall', venue_type: 'conference_hall',
    capacity: 150, price_per_hour: 8000, price_per_day: 40000, status: 'available',
    image_url: img('events/hall-3.jpg'),
    amenities: JSON.stringify(['Projector', 'Sound System', 'WiFi', 'AC']),
    description: 'Modern hall ideal for conferences, seminars and workshops.',
  },
  {
    id: 'local-venue-emerald-hall', name: 'Emerald Hall', venue_type: 'conference_hall',
    capacity: 120, price_per_hour: 7000, price_per_day: 35000, status: 'available',
    image_url: img('events/hall-4.jpg'),
    amenities: JSON.stringify(['Projector', 'WiFi', 'Whiteboard', 'AC']),
    description: 'A versatile hall for meetings, trainings and private functions.',
  },

  // --- Buffet / Dining ---
  {
    id: 'local-venue-grand-buffet', name: 'The Grand Buffet', venue_type: 'dining',
    capacity: 200, price_per_hour: 6000, price_per_day: 30000, status: 'available',
    image_url: img('events/buffet.jpg'),
    amenities: JSON.stringify(['Full Catering', 'Buffet Stations', 'Bar', 'AC']),
    description: 'Our signature buffet experience for parties and celebrations.',
  },
  {
    id: 'local-venue-buffet-lounge', name: 'SkyTop Buffet Lounge', venue_type: 'dining',
    capacity: 120, price_per_hour: 5000, price_per_day: 25000, status: 'available',
    image_url: img('events/buffet-2.jpg'),
    amenities: JSON.stringify(['Full Catering', 'Buffet Stations', 'Lounge Seating', 'AC']),
    description: 'A relaxed buffet lounge for intimate gatherings and family events.',
  },

  // --- Pools ---
  {
    id: 'local-venue-rooftop-pool', name: 'Rooftop Pool Deck', venue_type: 'pool',
    capacity: 80, price_per_hour: 6000, price_per_day: 30000, status: 'available',
    image_url: img('events/pool-1.jpg'),
    amenities: JSON.stringify(['Pool', 'Sun Loungers', 'Bar Service', 'Towels']),
    description: 'Poolside venue with stunning views - perfect for day parties.',
  },
  {
    id: 'local-venue-garden-pool', name: 'Garden Poolside', venue_type: 'pool',
    capacity: 60, price_per_hour: 5000, price_per_day: 25000, status: 'available',
    image_url: img('events/pool-2.jpg'),
    amenities: JSON.stringify(['Pool', 'Sun Loungers', 'Changing Rooms', 'Towels']),
    description: 'A serene poolside setting for relaxed events and pool parties.',
  },
  {
    id: 'local-venue-basement-pool', name: 'Basement Indoor Pool', venue_type: 'pool',
    capacity: 50, price_per_hour: 4000, price_per_day: 20000, status: 'available',
    image_url: img('events/basement-pool.jpg'),
    amenities: JSON.stringify(['Indoor Pool', 'Heated Water', 'Changing Rooms', 'Towels']),
    description: 'Private indoor pool area, great for swims and small events all year round.',
  },

  // --- Outdoors ---
  {
    id: 'local-venue-garden-lawn', name: 'Garden Lawn', venue_type: 'garden',
    capacity: 200, price_per_hour: 6000, price_per_day: 30000, status: 'available',
    image_url: img('events/outdoors.jpg'),
    amenities: JSON.stringify(['Open Air', 'Tent Ready', 'Parking', 'Power Supply']),
    description: 'Lush garden lawn for outdoor weddings and celebrations.',
  },
  {
    id: 'local-venue-sunset-gardens', name: 'Sunset Gardens', venue_type: 'garden',
    capacity: 150, price_per_hour: 5500, price_per_day: 28000, status: 'available',
    image_url: img('events/outdoors-2.jpg'),
    amenities: JSON.stringify(['Open Air', 'Tent Ready', 'Garden Lights', 'Parking']),
    description: 'Beautiful gardens that glow at sunset - magical for evening events.',
  },
  {
    id: 'local-venue-courtyard-gardens', name: 'Courtyard Gardens', venue_type: 'courtyard',
    capacity: 100, price_per_hour: 4500, price_per_day: 22000, status: 'available',
    image_url: img('events/outdoors-3.jpg'),
    amenities: JSON.stringify(['Open Air', 'Sheltered Areas', 'Garden Lights', 'Power Supply']),
    description: 'Charming courtyard gardens for intimate outdoor gatherings.',
  },
  {
    id: 'local-venue-riverside-lawn', name: 'Riverside Outdoor Lawn', venue_type: 'outdoor_lawn',
    capacity: 250, price_per_hour: 7000, price_per_day: 35000, status: 'available',
    image_url: img('events/outdoors-4.jpg'),
    amenities: JSON.stringify(['Open Air', 'Tent Ready', 'Parking', 'Scenic Views']),
    description: 'Expansive outdoor lawn with scenic views for big outdoor events.',
  },
];

// ----------------------------------------------------------------------------
// IMAGE FALLBACKS - so database rooms/venues without image_url still get one
// ----------------------------------------------------------------------------

export const roomImageFor = (room) => {
  if (room.image_url) return room.image_url;
  const type = (room.room_type || '').toLowerCase();
  if (type.includes('premium suite') || type.includes('imperial')) return img('rooms/premium-suite.jpg');
  if (type.includes('premium') && type.includes('2 bed')) return img('rooms/premium-2bed-1room.jpg');
  if (type.includes('2 bed')) return img('rooms/2bed-1room.jpg');
  if (type.includes('deluxe')) return img('rooms/regular-5.jpg');
  if (type.includes('premium')) return img('rooms/premium-suite-1.jpg');
  return img('rooms/regular-1.jpg'); // standard / regular / anything else
};

export const bathroomImageFor = (room) => {
  if (room.bathroom_image_url) return room.bathroom_image_url;
  const type = (room.room_type || '').toLowerCase();
  if (type.includes('premium suite') || type.includes('imperial')) return img('bathrooms/premium-suite-bathroom.jpg');
  if (type.includes('premium') && type.includes('2 bed')) return img('bathrooms/premium-2bed-1room-bathroom.jpg');
  if (type.includes('premium')) return img('bathrooms/premium-suite-1-bathroom.jpg');
  return img('bathrooms/random-bathroom.jpg');
};

export const venueImageFor = (venue) => {
  if (venue.image_url) return venue.image_url;
  const hay = `${venue.name || ''} ${venue.venue_type || ''}`.toLowerCase();
  if (hay.includes('ballroom') || hay.includes('hall')) return img('events/hall.jpg');
  if (hay.includes('buffet') || hay.includes('dining') || hay.includes('restaurant')) return img('events/buffet.jpg');
  if (hay.includes('pool')) return img('events/pool-1.jpg');
  if (hay.includes('garden') || hay.includes('terrace')) return img('events/outdoors.jpg');
  if (hay.includes('courtyard')) return img('events/outdoors-3.jpg');
  if (hay.includes('lawn') || hay.includes('outdoor')) return img('events/outdoors-4.jpg');
  return img('events/hall-2.jpg');
};
