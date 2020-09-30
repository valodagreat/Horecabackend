const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

//protect routes
exports.protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    //else if(req.cookies.token){
        //token = req.cookies.token;
    //}

    //Make sure the token is valid
    if(!token){
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        req.user = await User.findById(decoded.id);
        if(!req.user.name){
            return(next(new ErrorResponse('Not authorized to access this route', 401)))
        }
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
}

//Grant access to roles

exports.authorize = (...roles)=>{
    return (req, res, next)=>{
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse( `${req.user.role} role is not authorized to access this route` , 403));
        }
        next();
    }
}