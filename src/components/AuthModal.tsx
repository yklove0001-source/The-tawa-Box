import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api, setAuthToken } from '../services/api';
import { X, Lock, Mail, Phone, User as UserIcon, Building2, Check, ArrowRight, ShoppingBag, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';
import { GooglePromptModal } from './GooglePromptModal';

interface AuthModalProps {
  initialRole?: 'buyer' | 'seller';
  onClose: () => void;
  onSuccess: (user: User) => void;
  demoUsers: User[];
}

interface GoogleAuthProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialRole = 'buyer',
  onClose,
  onSuccess,
  demoUsers
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'buyer' | 'seller'>(initialRole);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Flow States
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleStep, setGoogleStep] = useState<'none' | 'select_role' | 'link_existing'>('none');
  const [googleProfile, setGoogleProfile] = useState<GoogleAuthProfile | null>(null);
  const [existingAccountToLink, setExistingAccountToLink] = useState<User | null>(null);
  const [googleMobile, setGoogleMobile] = useState('+91 ');

  // Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(identifier, password, role);
      setAuthToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Standard Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        name,
        email,
        mobile,
        password,
        role
      });
      setAuthToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Google Account Selection
  const handleStartGoogleAuth = () => {
    setError(null);
    setShowGooglePrompt(true);
  };

  // Google Profile Selected from prompt/popup
  const handleGoogleProfileSelected = async (profile: GoogleAuthProfile) => {
    setShowGooglePrompt(false);
    setLoading(true);
    setError(null);

    try {
      // 1. Verify identity with server
      const verifyRes = await api.verifyGoogleAuth({
        sub: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture
      });

      if (verifyRes.status === 'existing_user' && verifyRes.user && verifyRes.token) {
        // User already has a linked account with this Google Sub
        setAuthToken(verifyRes.token);
        onSuccess(verifyRes.user);
        onClose();
      } else if (verifyRes.status === 'account_exists_linking_required' && verifyRes.existingUser) {
        // Account exists with this Gmail email -> offer secure linking
        setExistingAccountToLink(verifyRes.existingUser);
        setGoogleProfile(profile);
        setGoogleStep('link_existing');
      } else {
        // New Google user -> ask how they want to use ApnaProperty (Buyer vs Seller)
        setGoogleProfile(profile);
        setGoogleStep('select_role');
      }
    } catch (err: any) {
      setError(err.message || 'Google verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Complete Google Registration after role selection
  const handleCompleteGoogleRegistration = async (selectedRole: 'buyer' | 'seller') => {
    if (!googleProfile) return;
    setLoading(true);
    setError(null);

    try {
      const regRes = await api.registerGoogleUser({
        sub: googleProfile.sub,
        email: googleProfile.email,
        name: googleProfile.name,
        picture: googleProfile.picture,
        role: selectedRole,
        mobile: googleMobile.trim() || undefined
      });

      setAuthToken(regRes.token);
      onSuccess(regRes.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not complete registration with Google account.');
    } finally {
      setLoading(false);
    }
  };

  // Confirm Linking Existing Account
  const handleConfirmLinkAccount = async () => {
    if (!existingAccountToLink || !googleProfile) return;
    setLoading(true);
    setError(null);

    try {
      const linkRes = await api.linkGoogleAccount({
        userId: existingAccountToLink.id,
        sub: googleProfile.sub,
        picture: googleProfile.picture
      });

      setAuthToken(linkRes.token);
      onSuccess(linkRes.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to link account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (u: User) => {
    setAuthToken(u.id);
    onSuccess(u);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {googleStep === 'select_role'
                  ? 'Welcome to ApnaProperty!'
                  : googleStep === 'link_existing'
                  ? 'Link Your Google Account'
                  : mode === 'login'
                  ? 'Welcome Back'
                  : 'Create Free Account'}
              </h3>
              <p className="text-xs text-slate-500">
                {googleStep === 'select_role'
                  ? 'How do you want to use ApnaProperty?'
                  : googleStep === 'link_existing'
                  ? 'Verify ownership to merge accounts'
                  : mode === 'login'
                  ? 'Sign in to access your unlocked properties & listings'
                  : 'Buy and sell properties directly across India'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* STEP: SELECT ROLE FOR NEW GOOGLE USER */}
            {googleStep === 'select_role' && googleProfile && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                  {googleProfile.picture ? (
                    <img
                      src={googleProfile.picture}
                      alt={googleProfile.name}
                      className="w-11 h-11 rounded-full object-cover border border-white shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {googleProfile.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-blue-700 font-semibold">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{googleProfile.name}</p>
                    <p className="text-xs text-slate-500 truncate">{googleProfile.email}</p>
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <h4 className="text-sm font-black text-slate-900">
                    How do you want to use ApnaProperty?
                  </h4>
                  <p className="text-xs text-slate-500">
                    Choose your primary account type. You can explore all listings either way.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Buyer Card */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleCompleteGoogleRegistration('buyer')}
                    className="p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                      I Want to Buy
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Explore properties, pay ₹50 to unlock owner phone & direct chat.
                    </p>
                  </button>

                  {/* Seller Card */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleCompleteGoogleRegistration('seller')}
                    className="p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                      I Want to Sell
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Post houses, flats, plots & land for direct serious buyers across India.
                    </p>
                  </button>
                </div>

                {/* Optional Mobile for Direct WhatsApp Alerts */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile Number (Optional, for SMS/WhatsApp alerts)
                  </label>
                  <input
                    type="tel"
                    value={googleMobile}
                    onChange={(e) => setGoogleMobile(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setGoogleStep('none')}
                    className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Back to other options
                  </button>
                </div>
              </div>
            )}

            {/* STEP: LINK EXISTING ACCOUNT WITH GOOGLE */}
            {googleStep === 'link_existing' && existingAccountToLink && googleProfile && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Existing Account Found</p>
                    <p className="text-amber-800 mt-0.5">
                      An account registered to <strong>{existingAccountToLink.email}</strong> already exists on ApnaProperty.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-slate-500 font-semibold">Account Details:</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Name:</strong> {existingAccountToLink.name}</p>
                    <p><strong>Email:</strong> {existingAccountToLink.email}</p>
                    <p><strong>Mobile:</strong> {existingAccountToLink.mobile}</p>
                    <p><strong>Role:</strong> {existingAccountToLink.role.toUpperCase()}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  Would you like to securely link your Google sign-in (<strong>{googleProfile.email}</strong>) to this existing account? All your unlocked properties and listings will remain intact.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleConfirmLinkAccount}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Confirm & Link to Google Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoogleStep('none')}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel and use password sign-in
                  </button>
                </div>
              </div>
            )}

            {/* NORMAL FLOW (LOGIN / SIGNUP) */}
            {googleStep === 'none' && (
              <>
                {/* 1. PRIMARY PROMINENT GOOGLE BUTTON */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleStartGoogleAuth}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 shadow-xs hover:shadow-md transition transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer group"
                  >
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                    <span>
                      {mode === 'login' ? 'Continue with Google' : 'Sign Up with Gmail / Google'}
                    </span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400 font-medium">
                    Fast 1-click verification with your Gmail account
                  </p>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-bold">
                    <span className="bg-white px-3 text-slate-400">
                      or continue with {mode === 'login' ? 'mobile / email' : 'email & password'}
                    </span>
                  </div>
                </div>

                {/* Mode Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Form */}
                {mode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number or Email
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="e.g. +91 9897011223 or yklove0001@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password (or leave blank for test accounts)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer"
                    >
                      {loading ? 'Logging in...' : 'Sign In with Mobile / Email'}
                    </button>

                    <div className="text-center pt-1">
                      <span className="text-xs text-slate-500">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setMode('signup')}
                          className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                        >
                          Sign Up
                        </button>
                      </span>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-3">
                    {/* Role selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">I want to:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('buyer')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            role === 'buyer'
                              ? 'border-blue-600 bg-blue-50 text-blue-800'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Buy Properties
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('seller')}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            role === 'seller'
                              ? 'border-blue-600 bg-blue-50 text-blue-800'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Sell / Post Property
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. rahul@gmail.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer"
                    >
                      {loading ? 'Registering...' : 'Sign Up with Mobile / Email'}
                    </button>

                    <div className="text-center pt-1">
                      <span className="text-xs text-slate-500">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                        >
                          Sign In
                        </button>
                      </span>
                    </div>
                  </form>
                )}

                {/* Demo 1-Click Login Helper */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    Quick 1-Click Test Logins:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {demoUsers.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectDemo(u)}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-blue-700 truncate transition cursor-pointer"
                      >
                        {u.role === 'admin' ? '🛡️ Admin' : u.role === 'seller' ? '🏡 Seller' : '👤 Buyer'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>

        </div>
      </div>

      {/* Google Sign In Account Chooser Prompt */}
      <GooglePromptModal
        isOpen={showGooglePrompt}
        defaultEmail="yklove0001@gmail.com"
        onClose={() => setShowGooglePrompt(false)}
        onSelectGoogleAccount={handleGoogleProfileSelected}
      />
    </>
  );
};
