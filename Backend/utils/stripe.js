import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    // For Create React App
    const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    
    // For Next.js
    // const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    console.log("Using Stripe key:", publishableKey); // For debugging
    
    if (!publishableKey) {
      console.error("Stripe publishable key is missing!");
      return null;
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;
