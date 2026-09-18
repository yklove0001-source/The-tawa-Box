import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, PlusCircle, Eye, Users, Trash2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { formatIndianPrice, formatArea, formatDate } from '../utils/format';

interface SellerDashboardProps {
  currentUser: User | null;
  onOpenAuth: (defaultRole?: 'buyer' | 'seller') => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  currentUser,
  onOpenAuth
}) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadProperties = () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getSellerProperties()
      .then(res => setProperties(res.properties))
      .catch(err => console.error('Failed to load seller properties:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperties();
  }, [currentUser]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Available' ? 'Sold' : 'Available';
    setActionLoading(id);
    try {
      await api.updatePropertyStatus(id, nextStatus as any);
      loadProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setActionLoading(id);
    try {
      await api.deleteProperty(id);
      loadProperties();
    } catch (err: any) {
      alert(err.message || 'Failed to delete property');
    } finally {
      setActionLoading(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to Seller Dashboard</h2>
        <p className="text-xs text-slate-500">
          Manage your listed properties, monitor buyer views, see how many buyers paid ₹50 to unlock your phone number, and mark properties as Sold.
        </p>
        <button
          onClick={() => onOpenAuth('seller')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition"
        >
          Sign In as Seller
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
              Seller Dashboard
            </span>
            <span className="text-xs text-slate-400 font-medium">{currentUser.name} ({currentUser.mobile})</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Properties</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track views, ₹50 unlocks, and manage your property sale status
          </p>
        </div>

        <Link
          to="/post-property"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Property</span>
        </Link>
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white h-44 rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No properties listed yet</h3>
          <p className="text-xs text-slate-500">
            Post your house, plot, flat, or land for sale. It's free to list, and your contact info remains protected.
          </p>
          <Link
            to="/post-property"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition"
          >
            + Post Your First Property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map(property => {
            const isAvailable = property.status === 'Available';
            const isBusy = actionLoading === property.id;

            return (
              <div
                key={property.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Photo & Specs */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <img
                    src={property.cover_image}
                    alt={property.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-700 text-white'
                        }`}
                      >
                        {property.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {formatIndianPrice(property.price)}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {formatArea(property.area, property.area_unit)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {property.title}
                    </h3>

                    <p className="text-xs text-slate-500 truncate">
                      {property.locality}, {property.city} ({property.state})
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Listed on {formatDate(property.created_at)}
                    </p>
                  </div>
                </div>

                {/* Metrics: Views & Unlocks Count */}
                <div className="flex items-center gap-4 py-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-center px-2">
                    <div className="flex items-center justify-center gap-1 text-slate-500 text-xs">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Views</span>
                    </div>
                    <span className="text-base font-black text-slate-900 mt-0.5 block">
                      {property.views || 0}
                    </span>
                  </div>

                  <div className="w-px h-8 bg-slate-200" />

                  <div className="text-center px-2">
                    <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-semibold">
                      <Users className="w-3.5 h-3.5" />
                      <span>₹50 Unlocks</span>
                    </div>
                    <span className="text-base font-black text-emerald-700 mt-0.5 block">
                      {property.unlocks_count || 0} Buyers
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                  {/* View Live */}
                  <Link
                    to={`/property/${property.slug || property.id}`}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                    title="View Property Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View</span>
                  </Link>

                  {/* Toggle Status */}
                  <button
                    onClick={() => handleToggleStatus(property.id, property.status)}
                    disabled={isBusy}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      isAvailable
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    <span>{isAvailable ? 'Mark as Sold' : 'Mark as Available'}</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(property.id, property.title)}
                    disabled={isBusy}
                    className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 transition"
                    title="Delete Property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
