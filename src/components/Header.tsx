import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, Building2, User as UserIcon, LogIn, LogOut, ShieldCheck, ShoppingBag, Menu, X, ChevronDown, Check } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: (defaultRole?: 'buyer' | 'seller') => void;
  onSwitchUser: (user: User) => void;
  demoUsers: User[];
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenAuth,
  onSwitchUser,
  demoUsers
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header 
      style={{ backgroundColor: '#126180' }}
      className="sticky top-0 z-40 text-white border-b border-white/15 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl shadow-xs group-hover:bg-white/30 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">ApnaProperty</span>
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">Sale Only</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                isActive('/') ? 'text-white bg-white/20 font-bold' : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>
            <Link
              to="/properties"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                isActive('/properties') ? 'text-white bg-white/20 font-bold' : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Properties
            </Link>
            {currentUser && (
              <Link
                to="/my-purchases"
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
                  isActive('/my-purchases') ? 'text-white bg-white/20 font-bold' : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                My Purchases
              </Link>
            )}
            {currentUser?.role === 'seller' && (
              <Link
                to="/my-properties"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/my-properties') ? 'text-white bg-white/20 font-bold' : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                My Properties
              </Link>
            )}
            {currentUser?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
                  isActive('/admin') ? 'text-white bg-white/20 font-bold' : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Action Buttons & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Primary Action: Post Property */}
            <Link
              to="/post-property"
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-4 py-2.5 rounded-xl text-sm font-black shadow-xs transition transform active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              Post Your Property
            </Link>

            {/* User Profile / Quick Switcher */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 hover:border-white/30 bg-white/15 text-white text-sm font-semibold transition"
                >
                  <div className="w-7 h-7 rounded-full bg-white text-[#126180] flex items-center justify-center text-xs font-bold uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate hidden md:inline">{currentUser.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-white/20 text-white hidden lg:inline">
                    {currentUser.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500">{currentUser.mobile}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/my-purchases"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        My Purchased Details (₹50)
                      </Link>
                      <Link
                        to="/my-properties"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        My Properties (Seller)
                      </Link>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        Admin Dashboard
                      </Link>
                    </div>

                    {/* Quick Demo Switcher */}
                    <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/70">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Switch Demo Role:
                      </p>
                      <div className="space-y-1">
                        {demoUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSwitchUser(u);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition ${
                              currentUser.id === u.id
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <span className="truncate">{u.name} ({u.role})</span>
                            {currentUser.id === u.id && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={onLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('buyer')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Signup</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/15 focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/15 py-3 space-y-1 bg-[#0e4e67] rounded-2xl p-2 mt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                isActive('/') ? 'text-white bg-white/20 font-bold' : 'text-white/90'
              }`}
            >
              Home
            </Link>
            <Link
              to="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                isActive('/properties') ? 'text-white bg-white/20 font-bold' : 'text-white/90'
              }`}
            >
              Browse Properties
            </Link>
            <Link
              to="/post-property"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-bold text-slate-950 bg-emerald-400"
            >
              + Post Your Property (Free)
            </Link>
            {currentUser && (
              <>
                <Link
                  to="/my-purchases"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-white/90"
                >
                  My Purchased Details (₹50)
                </Link>
                <Link
                  to="/my-properties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-white/90"
                >
                  My Properties (Seller)
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-amber-300"
                >
                  Admin Panel
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
