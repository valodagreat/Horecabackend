const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err,req,res,next) => {
    let error = {...err}
    error.message = err.message
    console.log(err);
    
    //Cast Error
    if(err.name === 'CastError'){
        const message = `Resource not found `;
        error = new ErrorResponse(message,404)
    }
    
    //Duplicate Error
    if (err.code === 11000) {
        const message = `Duplicate keys found`
        error = new ErrorResponse(message,400)
    }
    
    //Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(value => value.message);
        error = new ErrorResponse(message,400)

    }

    res.status(error.statusCode || 500).json({
        success : false,
        error : error.message || 'server error'
    })
}

module.exports = errorHandler;