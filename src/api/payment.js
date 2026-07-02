import api from './axios';
import { loadRazorpay } from '../lib/razorpay';

// Full Razorpay booking flow:
//   1. ask the backend to create an order (returns amount, order id and key_id)
//   2. open the Razorpay checkout with that order
//   3. verify the signature server-side once the user pays
//
// Resolves with the verify response on success, rejects with an Error otherwise.
export async function bookPackage({ user, packageId, couponCode }) {
  const sdkLoaded = await loadRazorpay();
  if (!sdkLoaded) {
    throw new Error('Could not load the payment gateway. Check your connection and try again.');
  }

  // 1. create the order on our backend — user_id is taken from the JWT server-side
  const { data: order } = await api.post('/orders/create', {
    package_id: packageId,
    // only send a coupon if one was actually applied
    ...(couponCode ? { coupon_code: couponCode } : {}),
  });

  // 2. hand off to Razorpay checkout, wrapped in a promise so callers can await it
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Devbhoomi Trips',
      description: order.package_name,
      order_id: order.razorpay_order_id,
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || '',
      },
      theme: { color: '#0284c7' },
      // 3. verify the payment signature on our backend
      handler: async (response) => {
        try {
          const { data } = await api.post('/orders/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          resolve(data);
        } catch (err) {
          reject(new Error(err.response?.data?.error || 'Payment verification failed'));
        }
      },
      modal: {
        // user closed the checkout without paying
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });

    // gateway-reported failure (card declined, etc.)
    rzp.on('payment.failed', (resp) => {
      reject(new Error(resp.error?.description || 'Payment failed'));
    });

    rzp.open();
  });
}
