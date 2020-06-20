const Tour=require('./../models/tourModels')
const Booking=require('./../models/bookingModel')
const catchAsync=require('./../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getOverview=catchAsync( async (req,res,next)=>{
    const tours=await Tour.find()
    res.status(200).render('overview',{
        title:'All Tours',
        tours
    })
})
exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });
  
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
  
    res.status(200).render('overview', {
      title: 'My Tours',
      tours
    });
  });
exports.getTour=catchAsync(async (req,res,next)=>{
    const tours=await Tour.findOne({slug:req.params.slug}).populate({
        path:'reviews',
        fields:'review rating user'
    })

    // if(!tours){
    //     return next(new AppError('There is no tour with that name',404));
    // }

    res.status(200).render('tour',{
      title:`${tours.name} Tour`,
      tours
    })
 })

 exports.login=(async (req,res)=>{
     res.status(200).render('login',{
         title:"Login into Your Account"
     })
 })

exports.getAccount=(async (req,res)=>{
    res.status(200).render('account',{
        title:"Your account"
    })
})



