const User=require('./../models/userModels.js');
const jwt=require('jsonwebtoken')
const crypto=require('crypto');
const Email = require('./../utils/email');
const {promisify}=require('util')
const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError')




const signToken=id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
});
}
const createSendToken = (user, statusCode, res) => {
  console.log('creating token');
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

exports.signup=catchAsync(async function(req,res,next){
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        active:req.body.active
    });
  //  const token=signToken(newUser._id);
  //   res.status(201).json({
  //       status:"successful",
  //       token,
  //       data:newUser
  //   })
  //const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);
  //await new Email(newUser, url).sendWelcome();
  createSendToken(newUser,201,res)
    next();
})
exports.login=catchAsync(async function(req,res,next){
    const {email,password}=req.body

    //1.check if email and password exist
    if(!email||!password){
        return next(new AppError('Please provide email and Password',400))
    }
    //2.check if user exist and password is correct
    const user=await User.findOne({email}).select('+password');
    const correct=await user.correctPassword(password,user.password);
    if(!correct||!user){
        return next(new AppError('Either your email or Password is incorrect',401))
    }
    console.log(user);
    //3.send the token
    //const token=signToken(user._id);
    // res.status(200).json({
    //     status:"successful",
    //     token,
    //     data:user
    // })
    createSendToken(user,201,res)
    next();
})

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  console.log("logging out")
  res.status(200).json({ status: 'success' });
};



exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //console.log("in try block")
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //console.log("in try block")
      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //console.log("in try block")
      // 3) Check if user changed password after the token was issued
      // if (currentUser.changedPasswordAfter(decoded.iat)) {
      //   return next();
      // }

      // THERE IS A LOGGED IN USER
      console.log("i am logged in user")
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};




exports.protect=catchAsync(async (req,res,next)=>{
    let token;
    //1.check if token exist
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.jwt){
      token=req.cookies.jwt;
    }
    console.log(token);
    if(!token){
        return next(new AppError('You are not logged in Please log in to get Access'),401);
    }
    //2. Verification Token
    const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    //console.log(decoded);
    //3.User still exist or not
    const freshUser=await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The token belonging to this User no longer exist',401));
    }
    //4.check if password not changed
    if(freshUser.changePasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed Password!Please log in again'),401);
    }
    //Grant access to Protected Route
    res.locals.user = freshUser;
    req.user=freshUser
    next();

})
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
  
      next();
    };
  };
  exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }
  
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
     // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    console.log("Here is reset URL",resetURL);
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
  })  
  //exports.resetPassword=(req,res,next)=>{}
  exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
  
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
  
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  
    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    //createSendToken(user, 200, res);
    const token=signToken(user._id);
    res.status(201).json({
      status:"success",
      token
    })
  });
  exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
  
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }
  
    // 3) If so, update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!
  
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  });
  