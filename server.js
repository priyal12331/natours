let port=8085||process.env.PORT;
const mongoose=require('mongoose')
const dotenv=require('dotenv');
const app=require('./app.js');
dotenv.config({path:'./config.env'});
//after configuring path it will just put all variables in environment object
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(con=>{
    console.log(con.connections);
    console.log("DB connection  successful !")
}).catch(err=>{
    console.log("DB connection unsuccessful")
})

app.listen(port,()=>{
    console.log(`listening to port ${8085}`);
})

