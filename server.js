const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDb = require('./config/db');
const fileupload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const limit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const auth = require('./routes/auth');
const user = require('./routes/user');
const blog = require('./routes/blog');

dotenv.config({path : './config/config.env'})

connectDb()

const app = express();

//Body Parser
app.use(express.json())

//CookieParser
app.use(cookieParser());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//file upload
app.use(fileupload());

//sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());


//Enable Cors
app.use(cors());

//set rate limit
const rateLimit = limit({
    windowMs : 10 * 60 * 1000,
    max : 100
})
app.use(rateLimit);

//Prevent http param pollution
app.use(hpp());

//Set static folder path
app.use(express.static(path.join(__dirname, 'public')));


app.use('/horeca', auth);
app.use('/horeca', user);
app.use('/horecacloud',blog)

app.use(errorHandler)

const PORT = process.env.PORT || 3005;

const server = app.listen(PORT, () =>console.log(`server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))

process.on('unhandledRejection',(err , promise) => {
    console.log(`Error ${err.message}`.red.bold)
    server.close(()=>process.exit(1));
})