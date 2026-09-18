'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Location, GeocodeResult } from '../types';
import { searchLocationSuggestions } from '../lib/api';
import { MapPin, Search, Loader2, X } from 'lucide-react';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: Location | null;
  onChange: (location: Location | null) => void;
  id: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  id
}) => {
  const [query, setQuery] = useState(value ? value.displayName || value.name : '');
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Synchronize internal query state if value prop changes from outside
  useEffect(() => {
    if (value) {
      setQuery(value.displayName || value.name);
    } else if (query && !isOpen) {
      setQuery('');
    }
  }, [value]);

  // Debounce location search query
  useEffect(() => {
    if (!query || query.trim().length < 2 || (value && (value.displayName === query || value.name === query))) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchLocationSuggestions(query);
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error('Location search failed', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: GeocodeResult) => {
    const newLocation: Location = {
      name: result.name,
      displayName: result.displayName,
      lat: result.lat,
      lng: result.lng
    };
    setQuery(result.displayName);
    onChange(newLocation);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <MapPin className="w-5 h-5 text-amber-500" />
        </div>
        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange(null); // Reset selection if typing again
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-sm"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
              aria-label="Clear location input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 text-sm text-slate-700">
          {suggestions.map((item, idx) => (
            <li key={`${item.lat}-${item.lng}-${idx}`}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-amber-50 focus:bg-amber-50 focus:outline-none transition-colors flex items-start space-x-2"
              >
                <Search className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{item.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
