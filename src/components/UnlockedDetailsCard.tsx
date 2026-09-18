import React from 'react';
import { Phone, MessageCircle, MapPin, User, CheckCircle2, ShieldCheck, FileText, Navigation } from 'lucide-react';
import { ProtectedSellerDetails, PublicProperty } from '../types';

interface UnlockedDetailsCardProps {
  property: PublicProperty;
  details: ProtectedSellerDetails;
}

export const UnlockedDetailsCard: React.FC<UnlockedDetailsCardProps> = ({
  property,
  details
}) => {
  const cleanPhone = details.seller_mobile.replace(/\D/g, '');
  const whatsappNumber = (details.seller_whatsapp || details.seller_mobile).replace(/\D/g, '');
  const whatsappMessage = encodeURIComponent(
    `Hello ${details.seller_name}, I saw your property "${property.title}" listed on ApnaProperty for ₹${(property.price / 100000).toFixed(2)} Lakh and would like to schedule an inspection visit.`
  );

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-lg relative overflow-hidden">
      
      {/* Verified Unlocked Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                Unlocked & Verified
              </span>
              <span className="text-xs text-slate-500 font-medium">₹50 Payment Complete</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">Complete Property & Seller Contact Details</h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4" />
          <span>Direct Seller Connection</span>
        </div>
      </div>

      {/* Seller Contact & Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        
        {/* Left Column: Seller Info */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seller Information</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {details.seller_type}
              </span>
            </div>

            <div>
              <p className="text-lg font-black text-slate-900">{details.seller_name}</p>
              <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{details.seller_mobile}</span>
              </p>
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-xs transition active:scale-98"
              >
                <Phone className="w-4 h-4" />
                <span>Call Seller</span>
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-xs transition active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Exact Address */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Complete Exact Property Address
            </span>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {details.full_address}
                </p>
                {details.landmark && (
                  <p className="text-xs text-slate-600 font-medium">
                    <span className="font-bold text-slate-700">Landmark:</span> {details.landmark}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  <span className="font-bold text-slate-700">PIN Code:</span> {details.pincode} • {property.city}, {property.state}
                </p>

                {/* Google Maps Exact Location Button */}
                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${details.full_address}, ${details.landmark ? details.landmark + ', ' : ''}${property.city}, ${property.state} ${details.pincode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open Exact Location in Google Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {details.private_seller_notes && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Private Notes from Seller:</span>
                </p>
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  "{details.private_seller_notes}"
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer Info Strip */}
      <div className="mt-6 pt-4 border-t border-emerald-100/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Property ID: <strong className="text-slate-800">{property.id}</strong></span>
        <span>Always available in your <strong>My Purchases</strong> dashboard</span>
      </div>

    </div>
  );
};
