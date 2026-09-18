import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, Home, Landmark, Trees, Store, Briefcase, PlusCircle, ArrowRight, ShieldCheck, CheckCircle2, PhoneCall } from 'lucide-react';
import { PublicProperty, PropertyType } from '../types';
import { PropertyCard } from '../components/PropertyCard';

interface HomePageProps {
  properties: PublicProperty[];
  loading: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ properties, loading }) => {
  const navigate = useNavigate();

  const [searchLocation, setSearchLocation] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation.trim()) params.append('search', searchLocation.trim());
    if (propertyType && propertyType !== 'All') params.append('property_type', propertyType);
    if (minBudget) params.append('min_price', minBudget);
    if (maxBudget) params.append('max_price', maxBudget);
    navigate(`/properties?${params.toString()}`);
  };

  const handleCategoryClick = (type: string) => {
    navigate(`/properties?property_type=${encodeURIComponent(type)}`);
  };

  const categories = [
    { label: 'House / Villa', type: 'House', icon: Home, count: properties.filter(p => p.property_type === 'House').length },
    { label: 'Flat / Apartment', type: 'Flat', icon: Building2, count: properties.filter(p => p.property_type === 'Flat').length },
    { label: 'Residential Plot', type: 'Plot', icon: Landmark, count: properties.filter(p => p.property_type === 'Plot').length },
    { label: 'Agricultural Land', type: 'Land', icon: Trees, count: properties.filter(p => p.property_type === 'Land').length },
    { label: 'Commercial Shop', type: 'Shop', icon: Store, count: properties.filter(p => p.property_type === 'Shop').length },
    { label: 'Office Space', type: 'Office', icon: Briefcase, count: properties.filter(p => p.property_type === 'Office').length },
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section 
        style={{ backgroundColor: '#126180' }}
        className="relative text-white pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-md"
      >
        {/* Subtle background overlay */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <span>Direct Seller and Buyer Market Place</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Find Your Perfect Property
            </h1>

            <p className="text-base sm:text-lg text-blue-50 max-w-2xl mx-auto font-normal">
              Buy houses, plots, land and other properties directly from property sellers.
            </p>
          </div>

          {/* Large Indian Search Box */}
          <div className="pt-4 max-w-4xl mx-auto w-full">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900 text-left grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
            >
              {/* Location Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Location / Area / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="e.g. Agra, Jaipur, Noida..."
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                >
                  <option value="All">All Categories</option>
                  <option value="House">House / Villa</option>
                  <option value="Flat">Flat / Apartment</option>
                  <option value="Plot">Residential Plot</option>
                  <option value="Land">Agricultural Land</option>
                  <option value="Shop">Commercial Shop</option>
                  <option value="Office">Office Space</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Budget (Max)
                </label>
                <select
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                >
                  <option value="">Any Budget</option>
                  <option value="3000000">Up to ₹30 Lakh</option>
                  <option value="5000000">Up to ₹50 Lakh</option>
                  <option value="7500000">Up to ₹75 Lakh</option>
                  <option value="10000000">Up to ₹1.0 Crore</option>
                  <option value="20000000">Up to ₹2.0 Crore</option>
                </select>
              </div>

              {/* Search Button */}
              <div>
                <button
                  type="submit"
                  style={{ backgroundColor: '#4169e1' }}
                  className="w-full hover:brightness-110 text-white py-3.5 px-6 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Property</span>
                </button>
              </div>
            </form>
          </div>

          {/* Seller CTA Banner in Hero Section */}
          <div className="pt-2 max-w-4xl mx-auto w-full">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl text-slate-900">
              <div className="max-w-xl space-y-2 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Are you a property owner or dealer?
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">
                  List Your Property For Sale Online
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  Reach thousands of genuine buyers looking for houses, plots, and land. 100% free to list your property.
                </p>
              </div>

              <button
                onClick={() => navigate('/post-property')}
                style={{ backgroundColor: '#4169e1' }}
                className="hover:brightness-110 text-white font-black py-3.5 px-8 rounded-2xl text-sm sm:text-base shadow-lg hover:shadow-blue-600/30 transition transform active:scale-98 shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-white" />
                <span>List Your Property</span>
              </button>
            </div>
          </div>

          {/* Quick stats strip at the bottom of Hero Section */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold text-white/95">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              100% Direct Property Sellers
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Transparent ₹50 Detail Unlock
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              No Heavy Brokerage Fees
            </span>
          </div>

        </div>
      </section>

      {/* Property Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Explore Property Categories</h2>
            <p className="text-xs sm:text-sm text-slate-500">Select a category to view active properties for sale</p>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.type}
                onClick={() => handleCategoryClick(cat.type)}
                className="bg-white hover:bg-blue-50/60 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition text-center flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 flex items-center justify-center mb-2.5 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                  {cat.label}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  {cat.count} listings
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* How ₹50 Unlock Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-emerald-50 rounded-3xl p-6 sm:p-10 border border-blue-100 shadow-xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              Transparent ₹50 Model
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              How ApnaProperty Works for Buyers & Sellers
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              We eliminated expensive 1% to 2% broker commissions. Connect directly with authentic property owners for just ₹50.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Browse & View For Free</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect property photos, videos, locality, asking price, area, and public specifications with zero registration fee.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Unlock Contact for ₹50</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pay a one-time ₹50 per property via UPI or card to unlock the verified seller's mobile number, WhatsApp, and exact street address.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Call & Finalize Direct</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Call and WhatsApp the seller directly to schedule site visits and negotiate your purchase price without middleman brokerage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Featured Properties For Sale</h2>
            <p className="text-xs sm:text-sm text-slate-500">Verified residential houses, apartments, and plots ready for sale</p>
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Browse All ({properties.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 6).map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* Seller CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Are you a property owner or dealer?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              List Your Property For Sale Online
            </h2>
            <p className="text-sm text-slate-300">
              Reach thousands of genuine buyers looking for houses, plots, and land. 100% free to list your property.
            </p>
          </div>

          <button
            onClick={() => navigate('/post-property')}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:text-white py-4 px-8 rounded-2xl text-base font-black shadow-lg transition transform active:scale-98 shrink-0 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Post Your Property Now</span>
          </button>
        </div>
      </section>

    </div>
  );
};
