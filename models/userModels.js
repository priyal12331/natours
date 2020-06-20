const mongoose=require('mongoose');
const validator=require('validator')
const crypto=require('crypto');
const bcrypt=require('bcryptjs')
//name,email,photo,password,confirmpasssword
//test1234
const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please tell us your name!']
        //maxlength:[20,'Max length must be not more than 20']
    },
    passwordResetToken:String,
    passwordResetExpires:Date,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
      },
    email:{
        type:String,
        required:[true,'Please tell us your name'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valide email']
    },
    photo:{
        type:String,
        default:'default.jpg'
        
    },
    password:{
        type:String,
        required:[true,'Please provide us your email'],
        minlength:8,
        select:false

    },
    confirmPassword:{
        type:String,
        required:[true,'Please provide confirm your email'],
        validate:{
            //this only works on save or create
            validator:function(el){
                return el==this.password;
            },
            message:'Passwords are not same!'
        }
    },
    
    passwordChangedAt:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }

})
userSchema.pre('save',async function(next){
    if(!this.isModified('password'))return next();

    this.password=await bcrypt.hash(this.password,12);
    this.confirmPassword=undefined;
    next();
})
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}
userSchema.methods.changePasswordAfter=function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10)
            return JWTTimestamp < changedTimestamp;
    }

    return false;
}
userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
  });
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    console.log({ resetToken }, this.passwordResetToken);
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };
const User=mongoose.model('User',userSchema);
module.exports=User