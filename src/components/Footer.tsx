import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Lock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">ApnaProperty</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Property Sale Only
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              India's clean and direct property buy & sell marketplace. Free public inspection of photos, video, price, and specs. Connect directly with genuine property owners for just ₹50 without paying high percentage brokerage.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Sellers
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-400 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                ₹50 Protected Contact
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">
                No Rent System
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition">Browse Properties For Sale</Link>
              </li>
              <li>
                <Link to="/post-property" className="hover:text-white transition">Post Property (Free Listing)</Link>
              </li>
              <li>
                <Link to="/my-purchases" className="hover:text-white transition">My Purchased Details (₹50)</Link>
              </li>
              <li>
                <Link to="/my-properties" className="hover:text-white transition">Seller Portal</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link to="/properties?property_type=House" className="hover:text-white transition">Independent Houses & Villas</Link>
              </li>
              <li>
                <Link to="/properties?property_type=Flat" className="hover:text-white transition">Apartments & Flats</Link>
              </li>
              <li>
                <Link to="/properties?property_type=Plot" className="hover:text-white transition">Residential Plots</Link>
              </li>
              <li>
                <Link to="/properties?property_type=Land" className="hover:text-white transition">Agricultural Land</Link>
              </li>
              <li>
                <Link to="/properties?property_type=Shop" className="hover:text-white transition">Commercial Shops & Offices</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ApnaProperty Portal. All rights reserved. Buy & Sell Properties directly.</p>
          <div className="flex items-center gap-4">
            <span>₹50 Single Property Unlock Model</span>
            <span>•</span>
            <span className="text-emerald-400">Direct Owner Deals</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
