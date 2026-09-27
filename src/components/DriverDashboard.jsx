import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { MapPin, Navigation, SignalHigh, AlertTriangle, CalendarClock, Clock, CheckCircle2 } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';

export default function DriverDashboard() {
  const { profile, driverDetails } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  
  // Scheduling State
  const [scheduledRides, setScheduledRides] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ from: '', to: '', time: '' });
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleMsg, setScheduleMsg] = useState('');

  const watchId = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (profile?.id) fetchScheduledRides();
    return () => {
      stopTracking();
    };
  }, [profile]);

  const fetchScheduledRides = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_rides')
        .select('*')
        .eq('driver_id', profile.id)
        .order('start_time', { ascending: true });
      if (error) throw error;
      if (data) setScheduledRides(data);
    } catch (err) {
      console.error("Error fetching rides:", err);
    }
  };

  const handleScheduleRide = async (e) => {
    e.preventDefault();
    if (!scheduleForm.from || !scheduleForm.to || !scheduleForm.time) {
      setScheduleMsg("Please fill in all fields.");
      return;
    }
    
    setIsScheduling(true);
    setScheduleMsg('');
    try {
      const { error } = await supabase.from('scheduled_rides').insert([{
        driver_id: profile.id,
        from_location: scheduleForm.from,
        to_location: scheduleForm.to,
        start_time: new Date(scheduleForm.time).toISOString()
      }]);
      
      if (error) throw error;
      setScheduleForm({ from: '', to: '', time: '' });
      setScheduleMsg("Ride scheduled successfully!");
      fetchScheduledRides();
    } catch (err) {
      console.error(err);
      setScheduleMsg("Error scheduling ride.");
    } finally {
      setIsScheduling(false);
      setTimeout(() => setScheduleMsg(''), 3000);
    }
  };

  const startTracking = async () => {
    if (!driverDetails?.rto_number) {
      setError("RTO Number not found. Please re-register your vehicle.");
      return;
    }
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setError(null);
    setIsTracking(true);

    // 1. Initialize Global Supabase Channel
    const channelName = 'tracking-global';
    console.log("Driver trying to create global channel");
    const channel = supabase.channel(channelName);
    
    channel.subscribe((status, err) => {
      console.log("Driver channel status:", status, err);
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to ${channelName} for broadcasting`);
      }
    });
    
    channelRef.current = channel;

    // 2. Start watching GPS position
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const newLocation = { lat: latitude, lng: longitude, speed: speed || 0 };
        
        setLocation(newLocation);
        console.log("Driver GPS Update:", newLocation);

        // 3. Broadcast to Supabase instantly
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'location',
            payload: {
              ...newLocation,
              id: driverDetails.rto_number,
              vehicleType: driverDetails.vehicle_type,
              timestamp: Date.now()
            }
          }).then((res) => {
             console.log("Broadcast success:", res);
          }).catch((err) => {
             console.error("Broadcast failed:", err);
          });
        }
      },
      (err) => {
        console.error("GPS Error:", err);
        setError(`Location Error: ${err.message}`);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  const stopTracking = () => {
    setIsTracking(false);
    
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    setLocation(null);
  };

  if (!profile || !driverDetails) {
    return <div className="py-20 text-center">Loading driver profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Driver Dashboard</h1>
        <p className="text-gray-500">Broadcast your live location to passengers</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Vehicle RTO</p>
            <p className="text-2xl font-bold text-gray-900 uppercase">{driverDetails.rto_number}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</p>
            <p className="text-lg font-medium text-gray-800 capitalize">{driverDetails.vehicle_type}</p>
          </div>
        </div>

        <div className="p-8 text-center">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all ${isTracking ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
            {isTracking ? <SignalHigh className="h-16 w-16" /> : <Navigation className="h-16 w-16" />}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isTracking ? 'Broadcasting Live Location...' : 'Ready to Start Trip?'}
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {isTracking 
              ? 'Passengers searching for your RTO number can now see you moving on their map in real-time.' 
              : 'Click start to begin broadcasting your GPS coordinates to waiting passengers.'}
          </p>

          {isTracking ? (
            <button 
              onClick={stopTracking}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-8 py-4 rounded-xl font-bold text-lg transition-colors w-full sm:w-auto"
            >
              Stop Tracking
            </button>
          ) : (
            <button 
              onClick={startTracking}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-green-200 w-full sm:w-auto"
            >
              Start Trip
            </button>
          )}

          {isTracking && location && (
            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                Lat: {location.lat.toFixed(4)}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                Lng: {location.lng.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule a Ride Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-red-600" />
            Schedule an Upcoming Ride
          </h2>
          <p className="text-gray-500 text-sm mt-1">Passengers will see this ride when they search this route.</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleScheduleRide} className="flex flex-col md:flex-row items-end gap-4 mb-8">
            <div className="w-full">
              <AutocompleteInput 
                value={scheduleForm.from}
                onChange={(val) => setScheduleForm({...scheduleForm, from: val})}
                placeholder="Where from?"
                label="Pickup"
              />
            </div>
            <div className="w-full">
              <AutocompleteInput 
                value={scheduleForm.to}
                onChange={(val) => setScheduleForm({...scheduleForm, to: val})}
                placeholder="Where to?"
                label="Dropoff"
              />
            </div>
            <div className="w-full">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date & Time</label>
              <input 
                type="datetime-local" 
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={isScheduling}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shrink-0 transition-colors disabled:opacity-50"
            >
              {isScheduling ? 'Saving...' : 'Schedule'}
            </button>
          </form>

          {scheduleMsg && (
            <div className="mb-6 text-center text-sm font-bold text-green-600 bg-green-50 py-3 rounded-lg">
              {scheduleMsg}
            </div>
          )}

          {/* List of scheduled rides */}
          {scheduledRides.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Your Upcoming Rides</h3>
              <div className="space-y-4">
                {scheduledRides.map(ride => (
                  <div key={ride.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 gap-4">
                    <div className="flex items-center gap-4 w-full">
                      <div className="bg-red-100 p-3 rounded-full text-red-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{ride.from_location} &rarr; {ride.to_location}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4" />
                          {new Date(ride.start_time).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {ride.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
