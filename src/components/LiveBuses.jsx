import React from 'react';
import { Bus, MapPin, Clock, Car } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LiveBuses({ buses = [] }) {
  const { t } = useLanguage();
  if (!buses || buses.length === 0) {
    return <div className="text-gray-500 py-8 text-center glass-panel">{t('noActiveRides')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('liveRidesTitle')}</h2>
        <span className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {t('liveTrackingActive')}
        </span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {buses.map((bus) => (
          <div key={bus.id} className={`glass-panel p-5 hover:-translate-y-1 transition-transform duration-300 border-2 ${bus.isReal ? 'border-red-200 bg-red-50/50' : 'border-transparent'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`${bus.isReal ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'} p-2.5 rounded-lg`}>
                  {bus.vehicleType === 'auto' ? (
                    <Car className="h-5 w-5" />
                  ) : (
                    <Bus className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-gray-900 uppercase">{bus.id}</h3>
                    {bus.isReal && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded capitalize">
                        {bus.vehicleType}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium truncate max-w-[150px]" title={bus.route}>{bus.route}</p>
                </div>
              </div>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                bus.status === 'On Time' ? 'bg-green-100 text-green-800 border border-green-200' : 
                bus.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {bus.status === 'Scheduled' ? 'Scheduled' : bus.status === 'On Time' ? t('statusOnTime') : t('statusDelayed')}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-lg text-gray-800">
                <Clock className="h-5 w-5 mr-2 text-red-600" />
                <span>{bus.status === 'Scheduled' ? 'Starts at' : t('etaLabel')} <strong className="text-red-700 text-xl">{bus.eta}</strong></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{t('nextStopLabel')} <strong className="text-gray-900">Main St. Station</strong></span>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-xs font-medium text-gray-500">
                {t('occupancyLabel')} <span className={`
                  ${bus.occupancy === 'Low' ? 'text-green-600' : ''}
                  ${bus.occupancy === 'Medium' ? 'text-yellow-600' : ''}
                  ${bus.occupancy === 'High' ? 'text-red-600' : ''}
                `}>{bus.occupancy}</span>
              </div>
              <button className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
                {t('viewOnMap')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
