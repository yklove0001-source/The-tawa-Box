import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';
import { PropertyType } from '../types';

interface FilterState {
  search: string;
  city: string;
  property_type: string;
  min_price: string;
  max_price: string;
  min_area: string;
  max_area: string;
  status: string;
  sort: string;
}

interface PropertyFilterBarProps {
  filters: FilterState;
  onChange: (key: keyof FilterState, val: string) => void;
  onReset: () => void;
  totalResults: number;
}

export const PropertyFilterBar: React.FC<PropertyFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalResults
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
      
      {/* Search keyword input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder="Search by area, locality, city, title (e.g. Dayalbagh, Agra, 3 BHK)..."
          className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden transition"
        />
      </div>

      {/* Filter Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* City Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            City / Location
          </label>
          <select
            value={filters.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-600"
          >
            <option value="All">All Cities</option>
            <option value="Agra">Agra</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Noida">Noida / Delhi NCR</option>
            <option value="Pune">Pune</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Indore">Indore</option>
          </select>
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Property Type
          </label>
          <select
            value={filters.property_type}
            onChange={(e) => onChange('property_type', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-600"
          >
            <option value="All">All Types (Sale Only)</option>
            <option value="House">🏠 House / Villa</option>
            <option value="Flat">🏢 Flat / Apartment</option>
            <option value="Plot">📐 Residential Plot</option>
            <option value="Land">🌳 Agricultural Land</option>
            <option value="Shop">🏪 Commercial Shop</option>
            <option value="Office">🏢 Office Space</option>
          </select>
        </div>

        {/* Maximum Budget */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Max Budget
          </label>
          <select
            value={filters.max_price}
            onChange={(e) => onChange('max_price', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-600"
          >
            <option value="">Any Budget</option>
            <option value="3000000">Up to ₹30 Lakh</option>
            <option value="5000000">Up to ₹50 Lakh</option>
            <option value="8000000">Up to ₹80 Lakh</option>
            <option value="12000000">Up to ₹1.2 Crore</option>
            <option value="20000000">Up to ₹2 Crore</option>
          </select>
        </div>

        {/* Sort by */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Sort Properties
          </label>
          <select
            value={filters.sort}
            onChange={(e) => onChange('sort', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-600"
          >
            <option value="newest">Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="area_asc">Area: Low to High</option>
            <option value="area_desc">Area: High to Low</option>
          </select>
        </div>
      </div>

      {/* Bottom status & reset row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">{totalResults}</span>
          <span className="text-slate-500">properties found for sale</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Availability toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => onChange('status', 'Available')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                filters.status === 'Available' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => onChange('status', 'Sold')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                filters.status === 'Sold' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Sold
            </button>
            <button
              onClick={() => onChange('status', 'All')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                filters.status === 'All' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
          </div>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-semibold px-2 py-1 rounded-md hover:bg-slate-100 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

    </div>
  );
};
