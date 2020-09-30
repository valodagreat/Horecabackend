const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendMail');
const crypto = require('crypto');

//@desc Register User
//@route POST /api/v1/auth/register
//@access Public

exports.register = async (req, res, next) => {
    try{
    const {name, email, password, role} = req.body;

    const user = await User.create({name, email, password, role})
    //create token
    sendToken(user,200,res)}
    catch(err){
        next(err);
    }
}

//@desc Login User
//@route POST /api/v1/auth/login
//@access Public

exports.login = async (req, res, next) => {
    try{
    const {email, password} = req.body;

    //Validate email and password
    if(!email || !password){
        next(new ErrorResponse('Please enter a valid email and password',400))
    }
    //Check for user
    const user = await User.findOne({ email}).select('+password')

    //Check if user exists
    if(!user){
        next(new ErrorResponse('Invalid Credentials',401))
    }

    //Check if password is valid
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        next(new ErrorResponse('Invalid Credentials',401))
    }

    //create token
    sendToken(user,200,res);}
    catch(err){
        next(err);
    }
}


//@desc Log user out/ clear cookies
//@route GET /api/v1/auth/logout
//@access Private

exports.logout = async (req, res, next) => {
    try{
    res.cookie('token','none',{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly : true
    })

    res.status(200).json({success : true , data : 'Logged out'});}
    catch(err){
        next(err);
    }
}

//@desc Get current logged in user
//@route GET /api/v1/auth/me
//@access Private

exports.getMe = async (req, res, next) => {
    try{
    const user = await User.findById(req.user.id);
    if(!user){
        next(new ErrorResponse('Invalid Credentials',401))
    }
    res.status(200).json({success : true , data : user});
}catch(err){
    next(err);
}
}

//@desc update user details
//@route GET /api/v1/auth/updatedetails
//@access Private

exports.updateDetails = async (req, res, next) => {
    try{
    const fieldsToUpdate = {
        name : req.body.name,
        email : req.body.email,
    }
    const user = await User.findByIdAndUpdate(req.user.id,fieldsToUpdate,{
        new : true,
        runValidators : true
    });
    if(!user){
        next(new ErrorResponse('Invalid Credentials',401))
    }
    res.status(200).json({success : true , data : user});}
    catch(err){
        next(err)
    }
}

//@desc Update user details
//@route PUT /api/v1/auth/updatepassword
//@access Private

exports.updatePassword = async (req, res, next) => {
    try{
    const user = await User.findById(req.user.id).select('+password');
    if(!(await user.matchPassword(req.body.currentPassword))){
        next(new ErrorResponse('Incorrect Password',401))
    }

    user.password = req.body.newPassword
    await user.save();
    sendToken(user,200,res);}
    catch(err){
        next(err)
    }
}

//@desc Forgot password
//@route GET /api/v1/auth/forgotPassword
//@access Public

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({email:req.body.email});
    if(!user){
        next(new ErrorResponse('No User with that email found',401))
    }
    //Get resetPasswordToken
    const resetToken = await user.getResetPasswordToken();

    await user.save({validateBeforeSave : false});
    
    //create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

    const message = `You are receiving this mail because you or someone else has requested the reset of password. Please make a PUT request
    to : \n\n ${resetUrl}`

    try {
        sendEmail({
            email : user.email,
            subject : 'Password Reset Request',
            message
        });
        res.status(200).json({success: true, data : 'Email sent'})
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave : false});
        return next(new ErrorResponse('Email sent failed',500));
    }
    
}

//@desc Reset password
//@route PUT /api/v1/auth/resetpassword/:resettoken
//@access Public

exports.resetPassword = async (req, res, next) => {
    try{
    //Create hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({resetPasswordToken,resetPasswordExpire : {$gt :Date.now()}});
    if(!user){
        next(new ErrorResponse('Invalid Token',400))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()
    sendToken(user,200,res);}
    catch(err){
        next(err);
    }
}

const sendToken = (user,statusCode,res)=>{
    try{
    // create token
    const token = user.getSignedJwtToken();

    const options = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly : true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({success : true, token});}
    catch(err){
        next(err);
    }
}