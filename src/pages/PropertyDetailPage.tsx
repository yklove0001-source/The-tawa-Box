import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Maximize2, Lock, ShieldCheck, CheckCircle2, ChevronLeft,
  Camera, Video, Phone, MessageCircle, AlertTriangle, Building, Home,
  Compass, Car, BedDouble, Bath, Layers, Share2, Check
} from 'lucide-react';
import { PublicProperty, ProtectedSellerDetails, User } from '../types';
import { api } from '../services/api';
import { formatIndianPrice, formatArea, formatDate } from '../utils/format';
import { PaymentModal } from '../components/PaymentModal';
import { UnlockedDetailsCard } from '../components/UnlockedDetailsCard';

interface PropertyDetailPageProps {
  currentUser: User | null;
  onOpenAuth: (defaultRole?: 'buyer' | 'seller') => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [property, setProperty] = useState<PublicProperty | null>(null);
  const [userAccess, setUserAccess] = useState({
    is_unlocked: false,
    is_owner: false,
    is_admin: false,
    unlock_cost: 50
  });
  const [unlockedSellerDetails, setUnlockedSellerDetails] = useState<ProtectedSellerDetails | null>(null);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadProperty = async () => {
    if (!idOrSlug) return;
    setLoading(true);
    try {
      const res = await api.getProperty(idOrSlug);
      setProperty(res.property);
      setUserAccess(res.user_access);

      // If user has unlocked this property, fetch seller contact details right away
      if (res.user_access.is_unlocked) {
        try {
          const unlockedRes = await api.getUnlockedDetails(idOrSlug);
          if (unlockedRes.unlocked) {
            setUnlockedSellerDetails(unlockedRes.seller_details);
          }
        } catch (err) {
          console.error('Could not load unlocked details:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load property details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperty();
  }, [idOrSlug, currentUser]);

  const handleUnlockClick = () => {
    if (!currentUser) {
      onOpenAuth('buyer');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (details: ProtectedSellerDetails) => {
    setShowPaymentModal(false);
    setUserAccess(prev => ({ ...prev, is_unlocked: true, unlock_status: 'UNLOCKED' }));
    setUnlockedSellerDetails(details);
    // Reload property details to ensure all components and backend counts synchronize
    loadProperty();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div className="w-40 h-8 bg-slate-200 rounded-lg animate-pulse" />
        <div className="w-full h-96 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="w-2/3 h-10 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Property Not Found</h2>
        <p className="text-sm text-slate-500">The property you are looking for does not exist or has been removed.</p>
        <Link to="/properties" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs">
          Browse Available Properties
        </Link>
      </div>
    );
  }

  const currentMedia = property.media[selectedMediaIdx] || {
    id: 'cover',
    media_type: 'photo',
    media_url: property.cover_image,
    is_cover: true
  };

  const specs = property.public_specifications || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Link>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Main Top Header: Title, Locality, Price, Status */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Strict Lock/Unlock Status Badge */}
            {userAccess.is_unlocked ? (
              <span className="bg-emerald-600 text-white text-xs font-black px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                UNLOCKED 🔓
              </span>
            ) : (
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                LOCKED 🔒
              </span>
            )}

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                property.status === 'Available'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {property.status}
            </span>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              {property.property_type}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Listed on {formatDate(property.created_at)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {property.title}
          </h1>

          <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{property.locality}, {property.city} ({property.state})</span>
          </div>
        </div>

        {/* Asking Price & Area Card */}
        <div className="md:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shrink-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asking Price</p>
          <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            {formatIndianPrice(property.price)}
          </div>
          <div className="flex items-center md:justify-end gap-1 text-xs font-bold text-slate-600 mt-1">
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatArea(property.area, property.area_unit)}</span>
          </div>
        </div>
      </div>

      {/* Media Gallery Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        {/* Main Display Frame */}
        <div className="relative aspect-16/9 w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
          {currentMedia.media_type === 'video' ? (
            <video
              src={currentMedia.media_url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video player.
            </video>
          ) : (
            <img
              src={currentMedia.media_url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Media Type Badge */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5">
            {currentMedia.media_type === 'video' ? (
              <>
                <Video className="w-3.5 h-3.5 text-red-400" />
                <span>Property Video</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-blue-300" />
                <span>Photo {selectedMediaIdx + 1} of {property.media.length}</span>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail Carousel */}
        {property.media.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {property.media.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setSelectedMediaIdx(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                  selectedMediaIdx === idx
                    ? 'border-blue-600 ring-2 ring-blue-600/30'
                    : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={item.media_url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {item.media_type === 'video' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: FREE SPECIFICATIONS & PUBLIC DESCRIPTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900">Property Overview & Specifications</h2>
          <p className="text-xs text-slate-500">Verified public specifications available for free inspection</p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Property Type</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{property.property_type}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Area</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{property.area} {property.area_unit}</p>
          </div>

          {specs.bedrooms !== undefined && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bedrooms</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-slate-500" />
                <span>{specs.bedrooms} BHK</span>
              </p>
            </div>
          )}

          {specs.bathrooms !== undefined && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bathrooms</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-slate-500" />
                <span>{specs.bathrooms} Baths</span>
              </p>
            </div>
          )}

          {specs.floors !== undefined && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Floors</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>{specs.floors} Floors</span>
              </p>
            </div>
          )}

          {specs.parking && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Parking</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-slate-500" />
                <span>{specs.parking}</span>
              </p>
            </div>
          )}

          {specs.facing && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Facing</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-slate-500" />
                <span>{specs.facing} Facing</span>
              </p>
            </div>
          )}

          {specs.road_width && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Road Width</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{specs.road_width}</p>
            </div>
          )}

          {specs.boundary_status && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Boundary Wall</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{specs.boundary_status}</p>
            </div>
          )}

          {specs.furnished_status && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Furnishing</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{specs.furnished_status}</p>
            </div>
          )}
        </div>

        {/* Public Description */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-2">About This Property</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
        </div>
      </div>

      {/* SECTION 2: ₹50 FULL DETAILS SYSTEM OR UNLOCKED DETAILS */}
      {userAccess.is_unlocked && unlockedSellerDetails ? (
        /* Render Unlocked Details */
        <UnlockedDetailsCard
          property={property}
          details={unlockedSellerDetails}
        />
      ) : (
        /* Render ₹50 Unlock Callout with STRICT Privacy Rule UI */
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-5 relative z-10">
            {/* Exact Required Main Heading and Subheading */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                <span>LOCKED 🔒</span>
                <span>•</span>
                <span>Mandatory Property Lock System</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>🔒 Full Property Details Locked</span>
              </h2>
              <p className="text-base sm:text-lg font-bold text-emerald-400">
                Pay ₹50 to unlock complete property & seller details
              </p>
              <p className="text-xs text-slate-300">
                Every property listed on the platform is locked by default. A buyer must successfully pay ₹50 for this specific property before its private information can be accessed.
              </p>
            </div>

            {/* Public vs Private Information Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* PUBLIC INFORMATION — ALWAYS VISIBLE */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">
                    PUBLIC INFORMATION — ALWAYS VISIBLE
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Free to View
                  </span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Property photos ({property.photo_count} photos)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Property video {property.has_video ? '(Available)' : '(Not provided)'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Property type ({property.property_type})
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Asking price ({formatIndianPrice(property.price)})
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Property area/size ({formatArea(property.area, property.area_unit)})
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> City ({property.city}) & Area ({property.locality})
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Basic public description
                  </li>
                </ul>
              </div>

              {/* PRIVATE INFORMATION — ALWAYS LOCKED */}
              <div className="bg-red-950/30 rounded-2xl p-4 border border-red-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-red-300 uppercase tracking-wider text-[11px]">
                    PRIVATE INFORMATION — ALWAYS LOCKED
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                    LOCKED 🔒
                  </span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-center gap-2 text-red-300">
                    <span>🔒</span> Full address & complete street address (Hidden)
                  </li>
                  <li className="flex items-center gap-2 text-red-300">
                    <span>🔒</span> House number & Plot number (Hidden)
                  </li>
                  <li className="flex items-center gap-2 text-red-300">
                    <span>🔒</span> Seller mobile number (Hidden)
                  </li>
                  <li className="flex items-center gap-2 text-red-300">
                    <span>🔒</span> Seller WhatsApp number & email (Hidden)
                  </li>
                  <li className="flex items-center gap-2 text-red-300">
                    <span>🔒</span> Exact location & map coordinates (Hidden)
                  </li>
                  <li className="flex items-center gap-2 text-red-300">
                    <span>🔒</span> Any other private seller information (Hidden)
                  </li>
                </ul>
              </div>
            </div>

            {/* Exact Required Button: Unlock Details – ₹50 */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={handleUnlockClick}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-8 rounded-2xl text-base shadow-xl hover:shadow-emerald-500/25 transition transform active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Lock className="w-5 h-5" />
                <span>Unlock Details – ₹50</span>
              </button>

              <div className="text-xs text-slate-400 space-y-0.5">
                <p className="font-semibold text-slate-300">✓ Permanent access once unlocked for this property</p>
                <p>No repeated charges for the same property • Appears in My Purchases</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && property && (
        <PaymentModal
          property={property}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
};
