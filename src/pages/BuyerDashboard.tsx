import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, Phone, MessageCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PurchaseItem, User } from '../types';
import { api } from '../services/api';
import { formatIndianPrice, formatArea, formatDate } from '../utils/format';

interface BuyerDashboardProps {
  currentUser: User | null;
  onOpenAuth: (defaultRole?: 'buyer' | 'seller') => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    api.getBuyerPurchases()
      .then(res => setPurchases(res.purchases))
      .catch(err => console.error('Failed to load purchases:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your purchases</h2>
        <p className="text-xs text-slate-500">
          Access all properties you have unlocked with ₹50, along with direct phone numbers and exact addresses.
        </p>
        <button
          onClick={() => onOpenAuth('buyer')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Buyer Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">Logged in as {currentUser.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Purchased Details</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Properties unlocked with ₹50. Direct seller phone numbers and exact addresses remain available permanently.
          </p>
        </div>

        <div className="bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-100 text-emerald-900 shrink-0 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-black text-sm block">{purchases.length} Properties</span>
            <span>Unlocked for direct contact</span>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white h-48 rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No properties unlocked yet</h3>
          <p className="text-xs text-slate-500">
            When you find a house, plot, or land you like, pay ₹50 to unlock the seller's direct contact details and exact location.
          </p>
          <Link
            to="/properties"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition"
          >
            Browse Properties For Sale
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map(item => {
            const prop = item.property;
            const cleanPhone = prop.seller_mobile.replace(/\D/g, '');
            const cleanWa = (prop.seller_whatsapp || prop.seller_mobile).replace(/\D/g, '');

            return (
              <div
                key={item.unlock_id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Photo and basic info */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <img
                    src={prop.cover_image}
                    alt={prop.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        {formatIndianPrice(prop.price)}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {formatArea(prop.area, prop.area_unit)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        ₹50 Unlocked
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{prop.locality}, {prop.city}</span>
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Unlocked on {formatDate(item.unlocked_at)} • Payment ID: {item.payment_id}
                    </p>
                  </div>
                </div>

                {/* Seller Quick Contact & Action Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                  <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Seller</span>
                      <span className="font-bold text-slate-900">{prop.seller_name}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1 bg-white hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${cleanWa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  <Link
                    to={`/property/${prop.slug || prop.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition text-center shadow-xs"
                  >
                    <span>View Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
