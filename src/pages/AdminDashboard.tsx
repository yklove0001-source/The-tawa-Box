import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Building2, CheckCircle2, IndianRupee, AlertCircle, Trash2, Check, X, ExternalLink } from 'lucide-react';
import { AdminStats, User } from '../types';
import { api } from '../services/api';
import { formatIndianPrice, formatDate } from '../utils/format';

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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}" permanently?`)) return;
    setActionBusy(id);
    try {
      await api.deleteProperty(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete property');
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
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Approval</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.properties.map(property => (
                <tr key={property.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={property.cover_image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/property/${property.slug || property.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 truncate block"
                        >
                          {property.title}
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

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {property.approval_status !== 'Approved' && (
                        <button
                          onClick={() => handleApproval(property.id, 'Approved')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Approve Property"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {property.approval_status !== 'Rejected' && (
                        <button
                          onClick={() => handleApproval(property.id, 'Rejected')}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                          title="Reject Property"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(property.id, property.title)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
