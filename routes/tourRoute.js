const express=require('express');
const tourRouter=express.Router();
const tourController=require('./../Controllers/tourController.js');
const authController=require('./../Controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
//{createTour,getTour,deleteTour,getTourwithid}=require('./../Controllers/tourController.js');
tourRouter.param('id',(req,res,next,val)=>{
    console.log(`tour id is ${val}`)
    next();
})
// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

tourRouter.route('/top-5-cheap').get(tourController.aliasTopTour,tourController.getAllTour);
tourRouter
.route('/')
.post(tourController.createTour)
.get(tourController.getAllTour)//authController.protect,
.delete(tourController.deleteTour);

tourRouter
.route('/:id')
.get(tourController.getTourwithid)
.patch(tourController.updateTour)
.delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);
module.exports=tourRouter;