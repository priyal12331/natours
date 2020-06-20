let express=require('express');
//Start Express App
let app=express();
let hpp=require('hpp');
let path =require('path')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser=require('cookie-parser')
let rateLimit=require('express-rate-limit');
let helmet=require('helmet')
const morgan=require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

if(process.env.NODE_ENV==='development'){
   app.use(morgan('tiny')); 
}
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
//Serving Static files
app.use(express.static(path.join(__dirname,'public')));
// Set security HTTP headers
app.use(helmet());

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
// Limit requests from same API
const limiter = rateLimit({
   max: 100,
   windowMs: 60 * 60 * 1000,
   message: 'Too many requests from this IP, please try again in an hour!'
 });
 app.use('/', limiter);
 // Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Prevent parameter pollution
app.use(
   hpp({
     whitelist: [
       'duration',
       'ratingsQuantity',
       'ratingsAverage',
       'maxGroupSize',
       'difficulty',
       'price'
     ]
   })
 );
//Test Middleware
// app.use((req,res,next)=>{
//   console.log(req.cookies);
// })


// Data sanitization against XSS
app.use(xss());
const tourRouter=require('./routes/tourRoute');
const userRoute=require('./routes/userRoute');
const reviewRouter=require('./routes/reviewRoutes')
const viewRouter=require('./routes/viewRoutes')
const bookingRouter=require('./routes/bookingRoutes')

app.use('/',viewRouter);
app.use('/api/v1/tour',tourRouter);
app.use('/api/v1/users',userRoute);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);


module.exports=app;