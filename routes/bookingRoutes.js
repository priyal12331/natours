const express = require('express');
const bookingController = require('./../Controllers/bookingController');
const authController = require('./../Controllers/authController');

const router = express.Router();
//console.log("in booking router")
router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
//router.get('my-tours',)
router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
