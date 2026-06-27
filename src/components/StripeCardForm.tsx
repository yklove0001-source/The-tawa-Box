import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'motion/react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface StripeCardFormProps {
  amount: number;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  mobile: string;
  address: string;
  notes: string;
  pointsToRedeem: number;
  pointsEarned: number;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export const StripeCardForm = ({
  amount,
  orderId,
  userId,
  userName,
  userEmail,
  mobile,
  address,
  notes,
  pointsToRedeem,
  pointsEarned,
  onSuccess,
  onCancel
}: StripeCardFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create PaymentIntent on our Express backend
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
          userId,
          userName,
          userEmail,
          mobile,
          address,
          notes,
          pointsToRedeem,
          pointsEarned
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize Stripe Payment Intent on server.');
      }

      const { clientSecret } = await response.json();

      // Step 2: Confirm the payment with Stripe CardElement
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('CardElement not found.');
      }

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement as any,
          billing_details: {
            name: userName,
            email: userEmail,
            phone: mobile,
          },
        },
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message || 'Payment declined.');
      }

      if (paymentResult.paymentIntent?.status === 'succeeded') {
        onSuccess(paymentResult.paymentIntent.id);
      } else {
        throw new Error('Payment was not completed successfully.');
      }
    } catch (err: any) {
      console.error('[Stripe Payment Error]', err);
      setError(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-[#5A3825]">
      <div className="bg-[#FAF8F4] border border-[#5A3825]/20 rounded-2xl p-4 shadow-inner">
        <label className="block text-xs font-serif font-black text-brand-primary uppercase tracking-wider mb-2">
          Card Information
        </label>
        <div className="py-2.5 px-1">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '15px',
                  color: '#5A3825',
                  fontFamily: 'Inter, sans-serif',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
                invalid: {
                  color: '#DC2626',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-start gap-3 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </motion.div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 py-3.5 px-4 bg-white hover:bg-neutral-50 border border-brand-primary/15 rounded-xl font-black text-xs text-brand-primary uppercase transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isProcessing || !stripe}
          className="flex-1.5 py-3.5 px-4 bg-[#5A3825] hover:bg-[#7A8B6B] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 rounded-full border-t-transparent border-white"
              />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Pay Rs. {amount}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
