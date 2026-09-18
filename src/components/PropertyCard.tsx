import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize2, Camera, Video, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { PublicProperty } from '../types';
import { formatIndianPrice, formatArea } from '../utils/format';

interface PropertyCardProps {
  property: PublicProperty;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const isAvailable = property.status === 'Available';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col group">
      
      {/* Property Photo & Indicators */}
      <div className="relative aspect-16/10 w-full bg-slate-100 overflow-hidden">
        <img
          src={property.cover_image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 ${
              isAvailable
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-white'
            }`}
          >
            {isAvailable ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                Available
              </>
            ) : (
              'Sold'
            )}
          </span>

          <span className="bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
            {property.property_type}
          </span>

          <span className="bg-amber-400 text-slate-950 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            LOCKED 🔒
          </span>
        </div>

        {/* Media indicators (Photos count & Video indicator) */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {property.photo_count > 0 && (
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {property.photo_count} Photos
            </span>
          )}
          {property.has_video && (
            <span className="bg-red-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Video className="w-3 h-3" />
              Video
            </span>
          )}
        </div>
      </div>

      {/* Card Content (ONLY public info, zero private seller details) */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Price & Area */}
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {formatIndianPrice(property.price)}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              <Maximize2 className="w-3 h-3 text-slate-500" />
              <span>{formatArea(property.area, property.area_unit)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition mb-1.5">
            {property.title}
          </h3>

          {/* Location (Area/Locality & City ONLY, no street/house number) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{property.locality}, {property.city} ({property.state})</span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {property.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] font-medium text-slate-400">
            ₹50 to unlock contact
          </div>
          <Link
            to={`/property/${property.slug || property.id}`}
            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition group-hover:bg-blue-600 group-hover:text-white"
          >
            <span>View Property</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
