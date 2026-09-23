import React, { useState, useEffect } from 'react';
import { X, Check, Mail, UserCheck, ShieldAlert, ArrowRight, Loader2, Sparkles, Building2, ShoppingBag } from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';

interface GoogleAuthProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

interface GooglePromptModalProps {
  isOpen: boolean;
  defaultEmail?: string;
  onClose: () => void;
  onSelectGoogleAccount: (profile: GoogleAuthProfile) => void;
}

// Preset popular demonstration Google accounts for instant seamless testing
const POPULAR_GOOGLE_DEMO_ACCOUNTS: GoogleAuthProfile[] = [
  {
    sub: 'google_sub_109283746152431',
    email: 'yklove0001@gmail.com',
    name: 'Yogendra Kumar',
    picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
  },
  {
    sub: 'google_sub_827364519283746',
    email: 'amit.verma.agra@gmail.com',
    name: 'Amit Verma',
    picture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120'
  },
  {
    sub: 'google_sub_918273645543210',
    email: 'priya.sharma.realty@gmail.com',
    name: 'Priya Sharma',
    picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  }
];

export const GooglePromptModal: React.FC<GooglePromptModalProps> = ({
  isOpen,
  defaultEmail,
  onClose,
  onSelectGoogleAccount
}) => {
  const [customEmail, setCustomEmail] = useState(defaultEmail || '');
  const [customName, setCustomName] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setCustomEmail(defaultEmail);
    }
  }, [defaultEmail]);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const cleanEmail = customEmail.trim().toLowerCase();
    const finalName = customName.trim() || cleanEmail.split('@')[0];
    const generatedSub = `google_sub_${Math.abs(cleanEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0))}`;
    
    onSelectGoogleAccount({
      sub: generatedSub,
      email: cleanEmail,
      name: finalName,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(finalName)}&backgroundColor=126180,4169e1`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Google Header styled cleanly like Google Account Chooser */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <GoogleIcon className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-slate-500">
                Choose an account to continue to ApnaProperty
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!useCustom ? (
            <>
              <p className="text-xs font-semibold text-slate-600">
                Select a Gmail account or enter your own Gmail address:
              </p>

              {/* Account list */}
              <div className="space-y-2">
                {POPULAR_GOOGLE_DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.sub}
                    type="button"
                    onClick={() => onSelectGoogleAccount(acc)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition flex items-center gap-3 group"
                  >
                    <img
                      src={acc.picture}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 truncate">
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        {acc.email}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition shrink-0" />
                  </button>
                ))}
              </div>

              {/* Use another account button */}
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition flex items-center justify-center gap-2"
              >
                <span>Use another Gmail account...</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
                Enter your Gmail address to sign in or register instantly.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail / Google Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseCustom(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Continue with this Gmail
                </button>
              </div>
            </form>
          )}

          {/* Privacy Note */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            To continue, Google will share your name, email address, language preference, and profile picture with ApnaProperty.
          </div>
        </div>

      </div>
    </div>
  );
};
