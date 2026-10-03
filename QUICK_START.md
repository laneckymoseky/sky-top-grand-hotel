# SkyTop Grand Hotel - Quick Start (Option 2)

## 5-Minute Setup

### Step 1: Install
```bash
npm install
```

### Step 2: Database
1. Go to https://supabase.com
2. Sign in / Create account
3. Create new project
4. Go to **SQL Editor**
5. Paste entire `SUPABASE_SCHEMA.sql`
6. Click **Execute** (wait 30 seconds)

### Step 3: Configure
```bash
cp .env.example .env.local
```

Open `.env.local` and add:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Get credentials:**
- Supabase Dashboard → Settings → API → Copy URL & anon key

### Step 4: Run
```bash
npm run dev
```

App opens at `http://localhost:5173` ✨

---

## What's New in Option 2 ⭐

### 1. Room Bubble View
- Interactive bubble interface
- Hover to see amenities
- Premium room badges
- Capacity indicator
- Fast filtering

Go to: `/rooms`

### 2. Event Booking
- Book event venues
- 6 venue types (ballroom, garden, terrace, etc.)
- Add services (catering, photography)
- Time-based or day-based pricing
- Event types: wedding, conference, birthday, etc.

Go to: `/events`

### 3. Staff Dashboard
- Worker login system
- Room management
- Booking assignments
- Issue tracking

### 4. Premium Room Filter
- Toggle premium only
- Price range slider
- Capacity-based search
- Floor selection
- Real-time filtering

---

## Key Routes

```
/                  → Landing page
/rooms             → Room bubbles ⭐
/rooms/:id         → Room detail
/events            → Event venues ⭐
/events/:id        → Venue detail
/booking/:roomId   → Book room
/event-booking/:id → Book event ⭐
/auth              → Login/signup
/dashboard/customer → Guest bookings
/dashboard/staff   → Staff panel
/dashboard/admin   → Analytics
/chat              → Support
/review/:bookingId → Room review
```

---

## Test It Out

### As Guest

1. **Sign Up**
   - Go to `/auth`
   - Create guest account
   - Email: `guest@hotel.com`
   - Password: `Test123!`

2. **Browse Rooms**
   - Go to `/rooms`
   - See room bubbles
   - Hover to see amenities
   - Filter premium rooms
   - Click "Book Now"

3. **Browse Events**
   - Go to `/events`
   - View event venues
   - Click "Book Event"
   - Select services
   - Complete booking

4. **Chat & Review**
   - Go to `/chat`
   - Message hotel staff
   - After stay: `/review/:bookingId`
   - Rate your experience

### As Staff

1. **Sign Up as Staff**
   - Email: `staff@hotel.com`
   - Password: `Test123!`
   - Role: receptionist

2. **Staff Dashboard**
   - Go to `/dashboard/staff`
   - View your assignments
   - Update room status
   - Message customers
   - Resolve issues

### As Admin

1. **Sign Up as Admin**
   - Email: `admin@hotel.com`
   - Password: `Test123!`
   - Role: admin

2. **Admin Dashboard**
   - Go to `/dashboard/admin`
   - View all bookings
   - See revenue charts
   - Check occupancy
   - Download reports

---

## File Structure (Important Files)

```
src/
├── pages/
│   ├── RoomsBrowsePage.jsx      ← Room bubble view
│   ├── EventsPage.jsx            ← Event venues
│   ├── EventBookingPage.jsx      ← NEW event booking
│   ├── BookingPage.jsx           ← Room booking
│   └── ... (other pages)
│
├── components/
│   ├── RoomBubble.jsx            ← NEW bubble component
│   └── ... (other components)
│
├── lib/
│   └── supabase.js               ← Database API (40+ functions)
│
└── store/
    └── authStore.js              ← Authentication state
```

---

## Database Tables (14)

```
hotel_staff
customers
rooms
room_bookings
room_cleaning_log

event_venues          ← NEW
event_bookings        ← NEW
event_services        ← NEW
event_service_bookings← NEW

payments
messages
guest_issues
guest_reviews
income_reports
monthly_analytics
```

---

## Adding Images

### Room Photos
1. Update database with image URLs
2. Edit `RoomBubble.jsx` - replace gradient with `<img>`
3. Add room images to placeholder divs

### Event Venue Photos
1. Add URLs to `event_venues` table
2. Update `EventsPage.jsx` to show images
3. Replace emoji placeholder with actual images

### Hotel Logo
1. Add to public folder
2. Import in components
3. Update header/footer

---

## Adding Lottie Animations

1. Download JSON from https://lottiefiles.com
2. Save to `src/animations/your-animation.json`
3. Import and use:

```jsx
import Lottie from 'lottie-react';
import animation from '../animations/your-animation.json';

<Lottie 
  animationData={animation} 
  loop={true}
  style={{ width: 300, height: 300 }}
/>
```

**Ideas:**
- Loading animation
- Success checkmark
- Event sparkles
- Room features
- Celebration for bookings

---

## M-Pesa Integration

See `API_INTEGRATION_GUIDE.md` for complete steps:

1. Get Daraja API credentials
2. Create `mpesaService.js`
3. Add M-Pesa initiation code
4. Handle payment callbacks

---

## Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Deployment

### Vercel
```bash
vercel deploy
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Environment Variables

```env
# Required
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# Optional - M-Pesa
VITE_MPESA_CONSUMER_KEY=key
VITE_MPESA_CONSUMER_SECRET=secret
VITE_MPESA_TILL_NUMBER=till
```

---

## Common Issues

### "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Supabase connection error
- Check `.env.local` credentials
- Verify Supabase project is active
- Wait 30 seconds after creating project

### Styles not loading
```bash
npm run dev
# Wait 10 seconds, refresh page
```

---

## Next Steps

1. ✅ npm install
2. ✅ Create Supabase project
3. ✅ Run SUPABASE_SCHEMA.sql
4. ✅ Configure .env.local
5. ✅ npm run dev
6. 🔄 Test room bubbles
7. 🔄 Test event booking
8. 🔄 Add images
9. 🔄 Integrate M-Pesa
10. 🔄 Deploy!

---

## Key Differences from Option 1

| Feature | Option 1 | Option 2 |
|---------|----------|----------|
| Hotels | Multiple ✅ | Single 🏨 |
| Room View | List | **Bubbles** ⭐ |
| Premium Filter | ❌ | **Yes** ⭐ |
| Event Booking | ❌ | **NEW!** ✨ |
| Staff System | ❌ | **Yes** ✨ |
| Event Services | ❌ | **Catering, Photo** ✨ |
| Venue Types | - | **6 types** ✨ |

---

**Ready to go!** 🚀

Questions? Check `README.md` for full documentation.

Need help? Review the page source code - it's well-commented!
