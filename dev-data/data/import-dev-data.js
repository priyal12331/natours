const fs=require('fs');
const mongoose=require('mongoose')
const dotenv=require('dotenv');
//console.log(process.argv)
const Tour=require(`${__dirname}/../../models/tourModels.js`);
const User=require(`${__dirname}/../../models/userModels.js`);
const Review=require(`${__dirname}/../../models/reviewModel.js`);
dotenv.config({path:'./config.env'});
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(con=>{
    //console.log(con.connections);
    console.log("DB connection  successful !")
}).catch(err=>{
    console.log("DB connection unsuccessful")
})

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));
//console.log(tours);
const importData=async()=>{
    try{
        await Tour.create(tours);
       // await User.create(users,{validateBeforeSave:false})
        //await Review.create(reviews);
        console.log("Data Successfully loaded")
    }
    catch(err){
        console.log(err)
    }

}

const deleteData=async()=>{
    try{
       await Tour.deleteMany();
       //await User.deleteMany();
      // await Review.deleteMany();

        console.log("Data Successfully deleted")
    }
    catch(err){
        console.log(err);
    }


}
//console.log(process.argv);
//deleteData();
importData();



