import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, AlertCircle, Smartphone, CreditCard, Building, ArrowRight, Loader2 } from 'lucide-react';
import { PublicProperty, ProtectedSellerDetails } from '../types';
import { api } from '../services/api';

interface PaymentModalProps {
  property: PublicProperty;
  onClose: () => void;
  onSuccess: (details: ProtectedSellerDetails) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  property,
  onClose,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');

  const handlePay = async (simulateFailure: boolean = false) => {
    setLoading(true);
    setErrorMessage(null);
    setStatus('processing');

    try {
      // 1. Create order on backend
      const order = await api.createPaymentOrder(property.id);

      if (order.already_unlocked) {
        // Fetch details directly
        const unlockedRes = await api.getUnlockedDetails(property.id);
        setStatus('success');
        setTimeout(() => {
          onSuccess(unlockedRes.seller_details);
        }, 1200);
        return;
      }

      // Simulate payment processing time (1.2 seconds)
      await new Promise(r => setTimeout(r, 1200));

      if (simulateFailure) {
        setStatus('failed');
        setErrorMessage('Payment failed via your selected bank/UPI handle. Please try again or choose another payment method.');
        setLoading(false);
        return;
      }

      // 2. Complete payment verification on backend
      const verifyRes = await api.verifyPayment({
        property_id: property.id,
        order_id: order.order_id,
        payment_id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        gateway: 'razorpay',
        status: 'success'
      });

      if (verifyRes.success && verifyRes.seller_details) {
        setStatus('success');
        setTimeout(() => {
          onSuccess(verifyRes.seller_details);
        }, 1500);
      } else {
        setStatus('failed');
        setErrorMessage(verifyRes.message || 'Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment checkout error:', err);
      setStatus('failed');
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Secure Direct Seller Unlock</h3>
              <p className="text-[11px] text-slate-500">One-time payment • No recurring fees</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading && status === 'processing'}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Property Summary Strip */}
          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center gap-3">
            <img
              src={property.cover_image}
              alt={property.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{property.title}</p>
              <p className="text-[11px] text-slate-500 truncate">{property.locality}, {property.city}</p>
              <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                Property ID: {property.id}
              </span>
            </div>
          </div>

          {status === 'checkout' && (
            <>
              {/* Pricing Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>Seller Contact & Address Unlock Fee</span>
                  <span className="font-semibold text-slate-900">₹50.00</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <span>Platform Fee & GST</span>
                  <span className="font-semibold text-emerald-600">₹0.00 (Included)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900">Total Payable</span>
                    <p className="text-[10px] text-slate-400">Valid permanently for this property</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-600">₹50</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Debit/Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'netbanking'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Netbanking</span>
                  </button>
                </div>
              </div>

              {/* UPI Quick Handles */}
              {paymentMethod === 'upi' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-600 mb-2">
                    <span className="font-semibold text-slate-700">Supported Apps:</span>
                    <span className="text-[11px] font-bold text-slate-500">Google Pay • PhonePe • Paytm • BHIM</span>
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. yourname@okhdfcbank)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Or proceed directly to complete payment using your default UPI app.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handlePay(false)}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 transform active:scale-98"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹50 & Unlock Complete Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Simulate Failed Payment Option for testing requirement */}
                <button
                  type="button"
                  onClick={() => handlePay(true)}
                  className="w-full text-slate-400 hover:text-slate-600 text-[11px] py-1 text-center font-medium"
                >
                  (Test Failed Payment Handling Flow)
                </button>
              </div>
            </>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <h4 className="text-base font-bold text-slate-900">Processing ₹50 Payment</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Communicating with payment gateway and recording your permanent property unlock receipt...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Payment of ₹50 Successful!</h4>
              <p className="text-xs text-slate-600 max-w-xs">
                Complete seller details and exact property location are now unlocked for your account.
              </p>
            </div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <div className="py-4 space-y-4 animate-fade-in">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-900">Payment Failed</h4>
                  <p className="text-xs text-red-700 mt-1">
                    {errorMessage || 'Your transaction could not be processed. Seller details remain protected.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStatus('checkout')}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl text-xs font-bold transition"
                >
                  Try Again (₹50)
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400">
            🔒 Bank-grade 256-bit encryption. Card & UPI credentials are never stored.
          </p>
        </div>

      </div>
    </div>
  );
};
