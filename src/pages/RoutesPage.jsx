import React, { useState } from 'react';
import { Map, MapPin, Search } from 'lucide-react';
import { useBuses } from '../hooks/useBuses';
import { useLanguage } from '../context/LanguageContext';

export default function RoutesPage() {
  const { t } = useLanguage();
  const { routes, loading, error } = useBuses();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutes = routes.filter(route => 
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    route.stops.some(stop => stop.toLowerCase().includes(searchQuery.toLowerCase())) ||
    route.busesAssigned.some(bus => bus.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500 font-medium">{t('loadingRoutes')}</div>;
  }

  if (error) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-red-500 font-medium">{t('errorLoadingRoutes')}: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{t('routesPageTitle')}</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          {t('routesPageSubtitle')}
        </p>

        {/* Global Route Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for any city, stop, or route name..."
            className="w-full pl-12 pr-6 py-4 rounded-2xl font-medium text-lg border border-gray-300 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all bg-white text-gray-900 shadow-sm"
          />
        </div>
      </div>

      {filteredRoutes.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No routes found</h3>
          <p className="text-gray-500">We couldn't find any routes passing through "{searchQuery}".</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map(route => (
            <div key={route.id} className="glass-panel p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
              <div className="bg-amber-100 p-3 rounded-xl">
                <Map className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{route.name}</h2>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {route.id}
                </span>
              </div>
            </div>

            <div className="flex-grow">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">{t('stopsLabel')}</h3>
              <ul className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {route.stops.map((stop, idx) => (
                  <li key={idx} className="relative flex items-center gap-3">
                    <div className="bg-white p-1 rounded-full border-2 border-amber-200 z-10 shadow-sm">
                      <MapPin className="h-3 w-3 text-amber-500" />
                    </div>
                    <span className="text-base text-gray-800 font-medium">{stop}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium">
                Assigned Buses: <strong className="text-gray-900">{route.busesAssigned.join(', ')}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
