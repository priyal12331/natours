const mongoose=require('mongoose')
const slugify=require('slugify')
const validator=require('validator');
const User=require('./userModels.js')
const tourSchema=new mongoose.Schema({
    name:{
        type: String,
        required:[true,'A tour must have a name'],
        unique:true,
        maxlength:[40,'A tour must have a length less than or equal to 40 '],
        minlength:[10,'A tour must have atlest name of length 10']
    },
    slug:String,
    
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above  1'],
        max:[5,'A rating maximum value should be 5']
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    // rating:{
    //     type: Number,
    //     default:4.5
    // },
    secretTour:{
        type:Boolean,
        default:false
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have a difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Difficulty is either easy,medium or difficult'
    },
   
    priceDiscount:{
        type:Number,
        // validate:{
        //     validator:function(val){
        //         //this only points to current document on New document creation
        //         return val<this.price;
        //     },
            message:'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    duration:{
        type:Number,
        required:[true,'A tour must have a duration']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    price:{
        type: Number,
        required:[true,'A tour must have a price']
    },
    startLocation: {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      },
      locations: [
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: String,
          description: String,
          day: Number
        }
      ],
      guides:[
          {
              type:mongoose.Schema.ObjectId,
              ref:'User'
          }
      ]
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })
//Document Middleware
//here this points to document
// tourSchema.pre('save', async function(next) {
//       const guidesPromises = this.guides.map(async id => await User.findById(id));
//       this.guides = await Promise.all(guidesPromises);
//       next();
//     });
tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-_v -passwordChangedAt'
    })
    next();
})
tourSchema.index({price:1,ratingsAverage:-1})
tourSchema.index({slug:1})

tourSchema.pre('save',function(){
    this.slug=slugify(this.name,{lower:true});
})
tourSchema.post('save',function(doc,next){
    console.log(doc);
    next();
})
// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
  });
  
//Query Middleware
//here this points to Query
//  /--this is called regular expression-/
// ^find will actually react to every query starting with find
/*tourSchema.pre('find',function(next){
    this.find({secretTour:{$ne:true}});
    next();
})
tourSchema.pre('findOne',function(next){
    this.find({secretTour:{$ne:true}});
    next();
})*/
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}});
    next();
})


const Tour= mongoose.model('Tour',tourSchema);
module.exports=Tour;


//validators are simple function which return either true or false
//if they got false it means there is some error