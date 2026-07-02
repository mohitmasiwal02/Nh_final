// Loads the Razorpay Checkout SDK on demand and caches the promise so the
// <script> tag is only ever injected once, no matter how many times we book.
let scriptPromise = null;

const SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export function loadRazorpay() {
  // already available (e.g. after a previous load)
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = null; // allow a retry on the next attempt
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}
