import api from './api/client';
import { loadScript } from './utils';
import { STORE_NAME } from './config';

/**
 * Opens Razorpay Checkout for an order created by the backend.
 * `info` = { keyId, orderId, amount, currency } from the API.
 * On success the signature is verified by the backend before the order is confirmed.
 */
export async function payWithRazorpay({ info, user, onVerified, onDismiss, onError }) {
  try {
    await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  } catch {
    onError?.('Could not load the payment window. Check your internet connection.');
    return;
  }
  const rzp = new window.Razorpay({
    key: info.keyId,
    amount: info.amount,
    currency: info.currency,
    name: STORE_NAME,
    description: 'Order payment',
    order_id: info.orderId,
    prefill: { name: user?.name, email: user?.email, contact: user?.phone },
    theme: { color: '#0B4A44' },
    modal: { ondismiss: () => onDismiss?.() },
    handler: async (response) => {
      try {
        const { data } = await api.post('/api/payments/verify', {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        onVerified?.(data);
      } catch (e) {
        onError?.(e?.response?.data?.message || 'Payment could not be verified.');
      }
    },
  });
  rzp.on('payment.failed', (r) => onError?.(r?.error?.description || 'Payment failed. You can try again from My orders.'));
  rzp.open();
}
