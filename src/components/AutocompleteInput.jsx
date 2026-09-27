import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AutocompleteInput({ value, onChange, onSelectLocation, placeholder, label, icon }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fetch from Nominatim (OpenStreetMap) API
  useEffect(() => {
    if (!value || value.length < 3 || !isOpen) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5&countrycodes=in`);
        const data = await response.json();
        const formattedSuggestions = data.map(item => ({
          name: item.display_name,
          lat: item.lat,
          lon: item.lon
        }));
        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [value, isOpen]);

  return (
    <div className="flex-grow w-full text-left flex items-center gap-3 relative" ref={wrapperRef}>
      {icon && (
        <div className="shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-grow relative">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
        <input 
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value.length >= 3) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-gray-900 font-bold focus:outline-none cursor-text truncate placeholder-gray-400"
          autoComplete="off"
        />
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-0 top-6 text-red-500">
             <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        
        {/* Dropdown Menu */}
        {isOpen && (suggestions.length > 0 || isLoading) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden">
            <ul className="py-2">
              {isLoading && suggestions.length === 0 && (
                 <li className="px-4 py-2.5 text-sm text-gray-500 text-center flex justify-center items-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin text-red-500" /> {t('searchingIndia')}
                 </li>
              )}
              {suggestions.map((option, index) => (
                <li 
                  key={index}
                  onClick={() => {
                    // Extract main name from display_name
                    const shortName = option.name.split(',')[0];
                    onChange(shortName);
                    if (onSelectLocation) {
                      onSelectLocation(option);
                    }
                    setIsOpen(false);
                  }}
                  className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors border-b border-gray-50 last:border-0 leading-snug"
                >
                  {option.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
