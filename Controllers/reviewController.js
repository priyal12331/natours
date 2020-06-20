const Review=require('./../models/reviewModel');
const catchAsync=require('./../utils/catchAsync')
const authController=require('./../Controllers/authController');
const factory=require('./../Controllers/handlerFactory');
//Getting All Reviews
exports.getAllReviews=catchAsync(async (req,res,next)=>{
    let filter={}
    if(req.params.tourId)filter={tour:req.params.tourId};
    const reviews=await Review.find(filter);
    res.status(200).json({
        status:"success",
        data:reviews
    })
})

//Post->Creating Reviews
exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
  };
exports.createReview=catchAsync(async(req,res,next)=>{
    // if(!req.body.tour)req.body.tour=req.params.tourId;
    // if(!req.body.user)req.body.user=req.user.id;
    const newReview=await Review.create(req.body);
    res.status(200).json({
        status:"success",
        data:newReview
    })
})
//Update the review
exports.updateReview = factory.updateOne(Review);
//Delete the Review
exports.deleteReview = factory.deleteOne(Review);