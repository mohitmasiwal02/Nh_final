import api from './axios';
import { loadRazorpay } from '../lib/razorpay';

// Open the Razorpay checkout for an already-created order and verify it on success.
// `order` is the backend response from /orders/create or /orders/:id/retry.
function openCheckout(order, user) {
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Northern Harrier',
      description: order.package_name,
      order_id: order.razorpay_order_id,
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || '',
      },
      theme: { color: '#000000' },
      // verify the payment signature on our backend
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

async function ensureSdk() {
  const sdkLoaded = await loadRazorpay();
  if (!sdkLoaded) {
    throw new Error('Could not load the payment gateway. Check your connection and try again.');
  }
}

export async function bookPackage({ user, packageId, couponCode, bookingDate, persons = 1 }) {
  await ensureSdk();

  // create the order on our backend — user_id is taken from the JWT server-side
  const { data: order } = await api.post('/orders/create', {
    package_id: packageId,
    bookingDate: bookingDate,
    persons,
    ...(couponCode ? { coupon_code: couponCode } : {}),
  });

  return openCheckout(order, user);
}

// Retry payment for an existing pending/failed order — the backend re-issues a
// Razorpay order on the SAME Order row, so no duplicate booking is created.
export async function retryPayment({ user, orderId }) {
  await ensureSdk();

  const { data: order } = await api.post(`/orders/${orderId}/retry`);

  return openCheckout(order, user);
}
