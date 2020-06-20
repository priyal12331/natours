let fs=require('fs');
const catchAsync = require('./../utils/catchAsync');
const Tour=require('./../models/tourModels.js');
const APIFeatures=require('./../utils/apiFeatures')
const factory=require('./../Controllers/handlerFactory');
//let data=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

exports.aliasTopTour=(req,res,next)=>{
    req.query.limit='5';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    req.query.sort='-ratingsAverage,price';
    next();
}
exports.getAllTour=async (req,res,next)=>{
    try{
        const features=new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().paginate();
        const tours=await features.query;
       // const tours=await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
        res.status(200).json({
        status:"successful",
        results:tours.length,
        data:{
            tours
        }
    })
    }
    catch(err){
        res.status(400).json({
            status:"failed"
        })
    }
}

exports.createTour=async (req,res,next)=>{
    //const newTour=new Tour({});
   // newTour.save().then
   try{
       const newTour= await Tour.create(req.body);
        res.status(200).json({
            status:"success",
            data:{
                tour:newTour
            }
        })
   }
   catch(err){
       res.status(400).json({
           status:"fail",
           message:err
       })

   }
   
}

exports.deleteTour=(req,res,next)=>{
    data.pop();
    res.status(200).json({
        status:"successful",
        data:{
            data
        }
    })
}
exports.getTourwithid=async (req,res,next)=>{
    try{
        const tours= await Tour.findById(req.params.id).populate('reviews');
        res.status('200').json({
        status:"successful",
        data:{
                tours
        }
    })
    }
    catch(err){
        res.status(400).json({
            message:"Enter right id dear user"
        })
    }
    
    

}
exports.updateTour=async (req,res,next)=>{

    try{
        const tours=await Tour.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        res.status(400).json({
            status:"successful",
            data:tours
        })

    }
    catch(err){
        res.status(400).json({
            message:"Enter right id dear user"
        })
    }


}


exports.deleteTour=async (req,res,next)=>{
    try{
        await Tour.findByIdAndDelete(req.params.id)
       // const tours=await Tour.find();
        res.status(204).json({
            status:"successful",
            data:null
        })

    }
    catch{
        res.status(400).json({
            message:"Enter right id dear user"
        })
    }

}
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
  
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    });
  });
  
  exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });
