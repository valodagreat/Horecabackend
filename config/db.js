const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config({path : './config.env'})

const connectDb = async () => {
    const conn = await mongoose.connect(process.env.MONG0_URI,{
        useCreateIndex : true,
        useNewUrlParser : true,
        useFindAndModify : false,
        useUnifiedTopology : true
    })
    console.log(`MongoDB is connected to ${conn.connection.host}`.green.underline.bold)
}

module.exports = connectDb