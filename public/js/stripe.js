/*   */
import axios from 'axios';
import { showAlert } from './alerts';
/* global Stripe */
const stripe = Stripe('pk_test_51Gvd5KAZbfJGK6U8yiXpUWi9tTRxHf4vof9KqB689IGTVFFF8bNn4b3VPQjKj4gJ4ZKIpedlFL9OsFpYz00ZtOQv00inTToGUR');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
     console.log(session);

   // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
   } catch (err) {
     console.log(err);
     showAlert('error', err);
   }
};
