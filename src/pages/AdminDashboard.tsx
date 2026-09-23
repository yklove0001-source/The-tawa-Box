import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Building2,
  CheckCircle2,
  IndianRupee,
  AlertCircle,
  Trash2,
  Check,
  X,
  ExternalLink,
  Star,
  Edit,
  Pin,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { AdminStats, User, PublicProperty } from '../types';
import { api } from '../services/api';
import { formatIndianPrice, formatDate } from '../utils/format';

type AdminProperty = AdminStats['properties'][0];

interface AdminDashboardProps {
  currentUser: User | null;
  onOpenAuth: (defaultRole?: 'buyer' | 'seller') => void;
  onSwitchToAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onOpenAuth,
  onSwitchToAdmin
}) => {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<AdminProperty | null>(null);
  const [featureTarget, setFeatureTarget] = useState<AdminProperty | null>(null);
  const [editTarget, setEditTarget] = useState<AdminProperty | null>(null);

  // Feature form state
  const [featurePosition, setFeaturePosition] = useState<number>(1);
  const [featureStartDate, setFeatureStartDate] = useState<string>('');
  const [featureEndDate, setFeatureEndDate] = useState<string>('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    price: 0,
    area: 0,
    locality: '',
    city: '',
    status: 'Available' as 'Available' | 'Sold',
    seller_name: '',
    seller_mobile: ''
  });

  const loadData = () => {
    setLoading(true);
    api.getAdminDashboard()
      .then(res => setData(res))
      .catch(err => console.error('Admin dashboard failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleApproval = async (id: string, status: 'Approved' | 'Rejected') => {
    setActionBusy(id);
    try {
      await api.adminUpdateApproval(id, status);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update approval');
    } finally {
      setActionBusy(null);
    }
  };

  const handleToggleSold = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Available' ? 'Sold' : 'Available';
    setActionBusy(id);
    try {
      await api.updatePropertyStatus(id, nextStatus as any);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionBusy(null);
    }
  };

  // Open Feature Modal
  const openFeatureModal = (property: AdminProperty) => {
    setFeatureTarget(property);
    setFeaturePosition(property.featured_position || 1);
    setFeatureStartDate(property.featured_start_date || new Date().toISOString().split('T')[0]);
    setFeatureEndDate(property.featured_end_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  };

  // Submit Feature / Pin
  const handleSaveFeature = async () => {
    if (!featureTarget) return;
    setActionBusy(featureTarget.id);
    try {
      await api.adminUpdateFeatured(featureTarget.id, {
        is_featured: true,
        featured_position: Number(featurePosition) || 1,
        featured_start_date: featureStartDate,
        featured_end_date: featureEndDate
      });
      setFeatureTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to feature listing');
    } finally {
      setActionBusy(null);
    }
  };

  // Unfeature directly
  const handleUnfeature = async (property: AdminProperty) => {
    setActionBusy(property.id);
    try {
      await api.adminUpdateFeatured(property.id, {
        is_featured: false
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to unfeature listing');
    } finally {
      setActionBusy(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (property: AdminProperty) => {
    setEditTarget(property);
    setEditForm({
      title: property.title,
      price: property.price,
      area: property.area,
      locality: property.locality,
      city: property.city,
      status: property.status,
      seller_name: property.seller_name || '',
      seller_mobile: property.seller_mobile || ''
    });
  };

  // Submit Edit
  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setActionBusy(editTarget.id);
    try {
      await api.updateProperty(editTarget.id, editForm);
      setEditTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update property');
    } finally {
      setActionBusy(null);
    }
  };

  // Confirm Delete Permanently
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionBusy(deleteTarget.id);
    try {
      await api.deleteProperty(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing permanently');
    } finally {
      setActionBusy(null);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Admin Authorization Required</h2>
        <p className="text-xs text-slate-500">
          You are currently signed in as <strong>{currentUser ? currentUser.name : 'Guest'}</strong> ({currentUser ? currentUser.role : 'None'}).
          Click below to 1-click switch into the Demo Admin account.
        </p>
        <button
          onClick={onSwitchToAdmin}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition"
        >
          Switch to Demo Admin
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalUsers: 0,
    totalProperties: 0,
    availableProperties: 0,
    soldProperties: 0,
    totalUnlocks: 0,
    totalRevenue: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">Full Governance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Administration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of users, listings, ₹50 unlock transactions, and moderation controls
          </p>
        </div>

        <button
          onClick={loadData}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-slate-200 bg-slate-50 px-3.5 py-2 rounded-xl"
        >
          Refresh Data
        </button>
      </div>

      {/* High Level Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.totalUsers}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Properties</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.totalProperties}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Available for Sale</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{metrics.availableProperties}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sold Properties</span>
          <span className="text-2xl font-black text-slate-700 mt-1 block">{metrics.soldProperties}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">₹50 Unlocks</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{metrics.totalUnlocks}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Unlock Revenue</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">₹{metrics.totalRevenue}</span>
        </div>
      </div>

      {/* Properties Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manage Properties</h2>
            <p className="text-xs text-slate-500">Approve, reject, mark sold, or delete properties</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{data?.properties.length || 0} Total Listings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Seller Details (Admin View)</th>
                <th className="py-3 px-4">Featured / Pin</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.properties.map(property => (
                <tr key={property.id} className={`hover:bg-slate-50/70 ${property.is_featured ? 'bg-amber-50/30' : ''}`}>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={property.cover_image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        {property.is_featured && (
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                            ★
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/property/${property.slug || property.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 truncate block flex items-center gap-1.5"
                        >
                          <span className="truncate">{property.title}</span>
                          {property.is_featured && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.2 rounded-md shrink-0">
                              ⭐ Pos #{property.featured_position || 1}
                            </span>
                          )}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate">
                          {property.locality}, {property.city}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {property.property_type}
                  </td>

                  <td className="py-3 px-4 font-black text-slate-900">
                    {formatIndianPrice(property.price)}
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{property.seller_name}</p>
                    <p className="text-[11px] text-slate-500">{property.seller_mobile}</p>
                  </td>

                  {/* Featured / Pin column with quick controls */}
                  <td className="py-3 px-4">
                    {property.is_featured ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                          <Star className="w-3 h-3 fill-slate-950" />
                          Position #{property.featured_position || 1}
                        </span>
                        {property.featured_end_date && (
                          <p className="text-[10px] text-slate-500">Till: {property.featured_end_date}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-medium">Standard</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleSold(property.id, property.status)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                        property.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      }`}
                    >
                      {property.status}
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        property.approval_status === 'Approved'
                          ? 'bg-blue-100 text-blue-800'
                          : property.approval_status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {property.approval_status}
                    </span>
                  </td>

                  {/* Complete Admin Action Buttons: [Edit] [Feature] [Unfeature] [Delete] */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* [Edit] Button */}
                      <button
                        onClick={() => openEditModal(property as any)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                        title="Edit Listing"
                      >
                        <Edit className="w-3 h-3 text-slate-600" />
                        <span>Edit</span>
                      </button>

                      {/* [Feature] or [Unfeature] Button */}
                      {property.is_featured ? (
                        <button
                          onClick={() => handleUnfeature(property as any)}
                          disabled={actionBusy === property.id}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                          title="Unfeature / Remove Pin"
                        >
                          <Star className="w-3 h-3 fill-amber-700 text-amber-700" />
                          <span>Unfeature</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openFeatureModal(property as any)}
                          disabled={actionBusy === property.id}
                          className="px-2 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-[11px] flex items-center gap-1 shadow-xs transition"
                          title="Feature / Pin to Top Position"
                        >
                          <Pin className="w-3 h-3" />
                          <span>Feature</span>
                        </button>
                      )}

                      {/* [Delete] Button with mandatory Confirmation Dialog */}
                      <button
                        onClick={() => setDeleteTarget(property as any)}
                        disabled={actionBusy === property.id}
                        className="px-2 py-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 font-bold rounded-lg text-[11px] flex items-center gap-1 transition"
                        title="Permanently Delete Listing"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>

                      {/* Quick Approval controls */}
                      {property.approval_status !== 'Approved' && (
                        <button
                          onClick={() => handleApproval(property.id, 'Approved')}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md"
                          title="Quick Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {property.approval_status !== 'Rejected' && (
                        <button
                          onClick={() => handleApproval(property.id, 'Rejected')}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                          title="Quick Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Popup Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Are you sure you want to delete this listing?
              </h3>
              <p className="text-xs text-slate-500">
                You are about to permanently delete <strong>"{deleteTarget.title}"</strong>. It will be immediately removed from all public searches and listings.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Listing ID:</span>
                <span className="font-mono text-slate-800">{deleteTarget.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seller:</span>
                <span className="font-bold text-slate-800">{deleteTarget.seller_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-800">{deleteTarget.locality}, {deleteTarget.city}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionBusy === deleteTarget.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-600/20 transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature & Pin Modal */}
      {featureTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pin & Feature Listing</h3>
                  <p className="text-[11px] text-slate-500">Keep listing in first position on public searches</p>
                </div>
              </div>
              <button
                onClick={() => setFeatureTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1">
              <p className="font-bold flex items-center gap-1">
                ⭐ {featureTarget.title}
              </p>
              <p className="text-[11px] text-amber-800">
                Featured listings will display a <strong>⭐ Featured</strong> badge and remain pinned at the very top of search results, ahead of regular availability sorting.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pinned Position Rank
                </label>
                <select
                  value={featurePosition}
                  onChange={(e) => setFeaturePosition(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="1">Position #1 (Absolute Top Slot)</option>
                  <option value="2">Position #2</option>
                  <option value="3">Position #3</option>
                  <option value="4">Position #4</option>
                  <option value="5">Position #5</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Position 1 appears first, followed by Position 2, 3, etc.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={featureStartDate}
                    onChange={(e) => setFeatureStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={featureEndDate}
                    onChange={(e) => setFeatureEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFeatureTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFeature}
                disabled={actionBusy === featureTarget.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20 transition flex items-center justify-center gap-1.5"
              >
                <Star className="w-4 h-4 fill-slate-950" />
                <span>Save & Pin Listing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Listing Details</h3>
                  <p className="text-[11px] text-slate-500">Admin quick modifications</p>
                </div>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Area
                  </label>
                  <input
                    type="number"
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Locality
                  </label>
                  <input
                    type="text"
                    value={editForm.locality}
                    onChange={(e) => setEditForm({ ...editForm, locality: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seller Name
                  </label>
                  <input
                    type="text"
                    value={editForm.seller_name}
                    onChange={(e) => setEditForm({ ...editForm, seller_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={actionBusy === editTarget.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent ₹50 Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Recent ₹50 Detail Unlock Payments</h2>
          <p className="text-xs text-slate-500">Live record of buyers unlocking seller details</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentPayments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">{p.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{p.buyer_name || 'Buyer'}</p>
                    <p className="text-[11px] text-slate-500">{p.buyer_mobile}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 truncate max-w-xs">
                    {p.property_title || p.property_id}
                  </td>
                  <td className="py-3 px-4 font-black text-emerald-700">₹{p.amount}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
