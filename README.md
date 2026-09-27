<div align="center">
  <h1>MeriYatra</h1>
  <p><strong>Next-Generation Real-Time Public Transit Ecosystem</strong></p>
</div>

---

## 📖 What is MeriYatra?

**MeriYatra** is a unified, real-time public transit tracking ecosystem built to bridge the gap between unorganized local transit operators (autos, cabs, and private city buses) and daily commuters. 

While apps like Google Maps provide static timetables, they fail in cities where local transit rarely follows a schedule. **MeriYatra** solves this by providing a highly accessible, Uber-like live-tracking experience directly on the web. 

By leveraging ultra-low-latency WebSockets, the platform allows local drivers to broadcast their exact GPS coordinates to the cloud, allowing passengers to instantly see every active vehicle around them, track specific rides, and get highly accurate arrival times based on live traffic data.

## ✨ Core Features

- 🌍 **Global Live Tracking:** Passengers instantly see every active driver around them broadcasting live GPS coordinates in real-time.
- ⏱️ **Smart OSRM ETA Engine:** Calculates precise driving duration in seconds from the moving vehicle to the passenger's destination, updating dynamically on every GPS tick.
- 📅 **Driver Dashboards & Scheduling:** Drivers can broadcast their location and schedule future rides, which instantly populate passenger search results.
- 🔍 **Instant Route Search:** Lightning-fast global search through predefined routes, stops, and assigned vehicles.
- 🌍 **Bilingual Accessibility:** Instant toggle between English and Hindi, ensuring it is accessible to all demographics.
- 🧩 **Chrome Extension Support:** 100% unified codebase runs natively as a Web App or as a Google Chrome Extension without breaking functionality.

## 🛠️ Tech Stack

- **Frontend:** React + Vite (Lightning-fast client-side rendering)
- **Styling:** Tailwind CSS (Premium "Atomic Orange" & "Oatmilk Latte" brand identity)
- **Real-Time Data:** Supabase Realtime WebSockets (Sub-100ms broadcasting latency)
- **Database:** Supabase PostgreSQL (Profiles, Driver Details, Scheduled Rides)
- **Mapping:** React-Leaflet (Interactive dynamic mapping)
- **Routing API:** Open Source Routing Machine (OSRM)
- **Location API:** Nominatim OpenStreetMap

## 📂 Project Structure

The codebase is organized modularly to ensure clean separation of concerns:

```text
MeriYatra/
├── public/                 # Static assets (logo, Chrome extension manifest)
├── src/
│   ├── components/         # Reusable React components
│   │   ├── AutocompleteInput.jsx # Smart location search with OSM API
│   │   ├── Dashboard.jsx         # Passenger view (Live tracking & ETA router)
│   │   ├── DriverDashboard.jsx   # Driver view (GPS broadcast & scheduling)
│   │   ├── LiveMap.jsx           # Leaflet map instance and auto-centering logic
│   │   ├── LiveBuses.jsx         # UI cards for active/scheduled vehicles
│   │   ├── Navbar.jsx            # Top navigation & Language toggle
│   │   └── Footer.jsx            # Application footer
│   ├── context/            # React Context Providers for global state
│   │   ├── AuthContext.jsx       # Supabase manual authentication state
│   │   └── LanguageContext.jsx   # English/Hindi translation state
│   ├── hooks/              # Custom React Hooks
│   │   ├── useBuses.js           # Logic for fetching static route data
│   │   └── useLocation.js        # HTML5 Geolocation API hook
│   ├── locales/            # Translation files
│   │   └── translations.js       # JSON map of EN/HI strings
│   ├── pages/              # Top-level Routing Pages
│   │   ├── AboutPage.jsx         # Brand & project information
│   │   ├── LoginPage.jsx         # Driver/Passenger Auth gateway
│   │   └── RoutesPage.jsx        # Static transit directory
│   ├── services/           # External API & Database Configurations
│   │   ├── supabase.js           # Supabase client initialization
│   │   └── mockData.js            # Hackathon mock routes & vehicles
│   ├── App.jsx             # Main Application Router
│   ├── index.css           # Global Tailwind & Custom Styles
│   └── main.jsx            # React DOM Entry Point
├── tailwind.config.js      # Tailwind theme configuration
├── vite.config.js          # Vite build configuration (base: './' for extension)
└── README.md               # You are here!

## 🚀 Getting Started (Web App)

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Open the App**
   Navigate to `http://localhost:5173` in your browser.

## 🧩 Installing the Chrome Extension

1. **Build the Project**
   ```bash
   npm run build
   ```
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
