import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PublicProperty } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilterBar } from '../components/PropertyFilterBar';
import { api } from '../services/api';
import { Building2, SearchX } from 'lucide-react';

export const PropertiesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PublicProperty[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state from URL or defaults
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || 'All',
    property_type: searchParams.get('property_type') || 'All',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_area: searchParams.get('min_area') || '',
    max_area: searchParams.get('max_area') || '',
    status: searchParams.get('status') || 'Available',
    sort: searchParams.get('sort') || 'newest',
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.city && filters.city !== 'All') params.city = filters.city;
      if (filters.property_type && filters.property_type !== 'All') params.property_type = filters.property_type;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.sort) params.sort = filters.sort;

      const res = await api.getProperties(params);
      setProperties(res.properties);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const handleFilterChange = (key: string, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    const newParams = new URLSearchParams(searchParams);
    if (val && val !== 'All') {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      city: 'All',
      property_type: 'All',
      min_price: '',
      max_price: '',
      min_area: '',
      max_area: '',
      status: 'Available',
      sort: 'newest',
    });
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Properties For Sale
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore houses, plots, flats, and land directly from owners and verified sellers
        </p>
      </div>

      {/* Filter Bar */}
      <PropertyFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        totalResults={properties.length}
      />

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No properties found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your location, budget, or property category filters.
          </p>
          <button
            onClick={handleReset}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

    </div>
  );
};
