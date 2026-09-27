import React, { useState, useRef, useEffect } from 'react';
import LiveBuses from './LiveBuses';
import LiveMap from './LiveMap';
import AutocompleteInput from './AutocompleteInput';
import { Route, MapPin, Navigation, Clock } from 'lucide-react';
import { useBuses } from '../hooks/useBuses';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';

export default function Dashboard() {
  const { t } = useLanguage();
  const { buses, routes, loading, error } = useBuses();
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [rtoNumber, setRtoNumber] = useState('');
  
  // Real Scheduled Rides State
  const [scheduledRides, setScheduledRides] = useState([]);
  const [isFetchingRides, setIsFetchingRides] = useState(true);
  
  // Global Tracking State
  const [activeVehicles, setActiveVehicles] = useState({});
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [trackedVehicle, setTrackedVehicle] = useState(null);

  // ETA State
  const [etaDestinationName, setEtaDestinationName] = useState('');
  const [etaDestinationCoords, setEtaDestinationCoords] = useState(null);
  const [liveEtaSeconds, setLiveEtaSeconds] = useState(null);
  const [isCalculatingEta, setIsCalculatingEta] = useState(false);

  useEffect(() => {
    fetchScheduledRides();

    // 1. Get passenger's location
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         pos => setPassengerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
         err => console.warn("Passenger location disabled:", err)
       );
    }

    // 2. Subscribe to Global GPS Channel
    const channelName = 'tracking-global';
    console.log("Passenger subscribing to:", channelName);
    const channel = supabase.channel(channelName);
    
    channel.on('broadcast', { event: 'location' }, ({ payload }) => {
       setActiveVehicles(prev => ({
          ...prev,
          [payload.id]: {
            ...payload,
            localTimestamp: Date.now() // Stamp it with the passenger's clock to prevent device clock drift bugs
          }
       }));
    }).subscribe();

    // 3. Cleanup stale vehicles (remove if no signal for 30 seconds)
    const cleanupInterval = setInterval(() => {
       setActiveVehicles(prev => {
          const now = Date.now();
          const next = { ...prev };
          let changed = false;
          Object.keys(next).forEach(id => {
             if (now - next[id].localTimestamp > 30000) {
                 delete next[id];
                 changed = true;
             }
          });
          return changed ? next : prev;
       });
    }, 10000);

    return () => {
      channel.unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, []);

  // OSRM Routing Effect
  useEffect(() => {
    const calculateETA = async () => {
      const vehicle = activeVehicles[trackedVehicle];
      if (!vehicle || !etaDestinationCoords) return;
      
      setIsCalculatingEta(true);
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${vehicle.lng},${vehicle.lat};${etaDestinationCoords.lon},${etaDestinationCoords.lat}?overview=false`);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          setLiveEtaSeconds(data.routes[0].duration);
        }
      } catch (err) {
        console.error("OSRM Routing Error:", err);
      } finally {
        setIsCalculatingEta(false);
      }
    };

    calculateETA();
  }, [trackedVehicle, activeVehicles[trackedVehicle]?.localTimestamp, etaDestinationCoords]);

  const fetchScheduledRides = async () => {
    setIsFetchingRides(true);
    try {
      // 1. Fetch scheduled rides
      const { data: rides, error: ridesError } = await supabase
        .from('scheduled_rides')
        .select('*')
        .in('status', ['scheduled', 'active'])
        .order('start_time', { ascending: true });
        
      if (ridesError) throw ridesError;

      if (rides && rides.length > 0) {
        // 2. Fetch corresponding driver details (RTO & Vehicle Type)
        const driverIds = rides.map(r => r.driver_id);
        const { data: details, error: detailsError } = await supabase
          .from('driver_details')
          .select('id, rto_number, vehicle_type')
          .in('id', driverIds);

        // 3. Combine the data
        const formattedRides = rides.map(ride => {
          const detail = details?.find(d => d.id === ride.driver_id);
          return {
            id: detail?.rto_number || 'DRIVER-' + ride.id.substring(0, 4).toUpperCase(),
            vehicleType: detail?.vehicle_type || 'bus',
            isReal: true,
            routeId: ride.id,
            route: `${ride.from_location} - ${ride.to_location}`,
            status: 'Scheduled',
            eta: new Date(ride.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            rating: '⭐4.3/5.0',
            rawTime: ride.start_time
          };
        });
        setScheduledRides(formattedRides);
      } else {
        setScheduledRides([]);
      }
    } catch (err) {
      console.error("Error fetching rides:", err);
    } finally {
      setIsFetchingRides(false);
    }
  };

  const handleFindRide = () => {
    if (!rtoNumber.trim()) {
      setTrackedVehicle(null);
      return;
    }
    setTrackedVehicle(rtoNumber.trim().toUpperCase());
  };

  const allStops = [...new Set(routes.flatMap(route => route.stops))].sort();

  const matchingRouteIds = routes.filter(route => {
    if (!fromStop && !toStop) return true;
    
    const hasFrom = fromStop ? route.stops.includes(fromStop) : true;
    const hasTo = toStop ? route.stops.includes(toStop) : true;
    
    // Ensure 'from' comes before 'to' if both are selected
    if (fromStop && toStop && hasFrom && hasTo) {
      return route.stops.indexOf(fromStop) < route.stops.indexOf(toStop);
    }
    
    return hasFrom && hasTo;
  }).map(r => r.id);

  const filteredBuses = buses.filter(bus => matchingRouteIds.includes(bus.routeId));

  // Filter Real Scheduled Rides based on the from/to search text
  const filteredScheduled = scheduledRides.filter(ride => {
    if (!fromStop && !toStop) return true;
    const hasFrom = fromStop ? ride.route.toLowerCase().includes(fromStop.toLowerCase()) : true;
    const hasTo = toStop ? ride.route.toLowerCase().includes(toStop.toLowerCase()) : true;
    return hasFrom && hasTo;
  });

  // Combine them, putting real scheduled rides at the top
  const combinedRides = [...filteredScheduled, ...filteredBuses];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center py-12 lg:py-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          {t('dashHeroTitle1')} <span className="text-red-600">{t('dashHeroTitle2')}</span> {t('dashHeroTitle3')}
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">
          {t('dashHeroSubtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
          <div className="w-full sm:w-auto text-center sm:text-left">
            <input 
              type="text" 
              value={rtoNumber}
              onChange={(e) => {
                setRtoNumber(e.target.value.toUpperCase());
                if (e.target.value === '') {
                  setTrackedVehicle(null);
                  setEtaDestinationCoords(null);
                  setLiveEtaSeconds(null);
                }
              }}
              placeholder={t('dashRtoPlaceholder')} 
              className="w-full px-6 py-3.5 rounded-xl font-medium text-lg border border-gray-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all uppercase bg-white text-gray-900 shadow-sm"
            />
            {trackedVehicle && !activeVehicles[trackedVehicle] && (
              <p className="mt-2 text-sm font-bold text-red-600">
                Driver {trackedVehicle} is not currently broadcasting.
              </p>
            )}
            {trackedVehicle && activeVehicles[trackedVehicle] && (
              <p className="mt-2 text-sm font-bold text-green-600">
                Tracking {trackedVehicle} in real-time!
              </p>
            )}
          </div>
          <button 
            onClick={handleFindRide}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-200 shrink-0 self-start"
          >
            {t('dashFindRideBtn')}
          </button>
        </div>

        {/* Dynamic ETA Router */}
        {trackedVehicle && (
          <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between shadow-sm">
            <div className="flex-1 w-full">
              <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                <Navigation className="h-5 w-5" /> Calculate Live ETA for {trackedVehicle}
              </h3>
              <AutocompleteInput 
                value={etaDestinationName}
                onChange={setEtaDestinationName}
                onSelectLocation={(loc) => setEtaDestinationCoords(loc)}
                placeholder="Where do you want to go?"
              />
            </div>
            
            {liveEtaSeconds !== null && (
              <div className="bg-white px-8 py-4 rounded-xl shadow-sm text-center min-w-[200px] border border-red-200">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" /> Estimated Time
                </p>
                <div className="text-4xl font-black text-red-600">
                  {Math.ceil(liveEtaSeconds / 60)} <span className="text-xl">min</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Route Selector (From/To) */}
        <div className="mt-12 max-w-3xl mx-auto glass-panel p-4 flex flex-col md:flex-row items-center gap-4">
          <AutocompleteInput 
            value={fromStop}
            onChange={setFromStop}
            placeholder={t('dashPickupPlaceholder')}
            label={t('dashFrom')}
            icon={
              <div className="bg-amber-100 p-2.5 rounded-lg">
                <MapPin className="h-5 w-5 text-amber-600" />
              </div>
            }
          />
          
          <div className="hidden md:flex text-gray-300 shrink-0 px-2">
            <Route className="h-5 w-5" />
          </div>
          
          <AutocompleteInput 
            value={toStop}
            onChange={setToStop}
            placeholder={t('dashDropPlaceholder')}
            label={t('dashTo')}
            icon={
              <div className="bg-red-100 p-2.5 rounded-lg">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
            }
          />
        </div>
      </div>

      {/* Stats/Features row removed for simplicity */}
      {/* Main Content Areas */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 font-medium">{t('dashLoadingData')}</div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-medium">{t('dashErrorData')} {error}</div>
      ) : (
        <>
          {/* Show Live Rides (Scheduled + Mock) at the top */}
          {!trackedVehicle && (
            <div className="mb-12">
              <LiveBuses buses={combinedRides} />
            </div>
          )}
          
          {/* Show the map below Live Rides */}
          <LiveMap 
            buses={filteredBuses} 
            activeVehicles={activeVehicles} 
            passengerLocation={passengerLocation}
            trackedVehicle={trackedVehicle}
          />
        </>
      )}
    </div>
  );
}
