const Blog = require('../models/Blog');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path')

//@desc Get all blogs
//@route GET /blog
//@access Public

exports.getBlogs = async (req, res, next) => {
    try{
    res.status(200).json(res.advancedResults)
    }catch(err){
        next(err)
    }
    
}

//@desc Get a Blog
//@route GET /blog/:id
//@access Public

exports.getBlog = (req, res, next) => {
    Blog.find({slug : req.params.id}).then((info) =>{
        if(!info){
            return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`,404))
        }
        res.status(200).json({success : true, message : info})}).catch(err => next(err))
}

//@desc Create new blog
//@route POST /blog
//@access Private

exports.createBlog = async (req, res, next) => {
    //const info = await Blog.create(req.body);

    //Add user to request body
    req.body.user = req.user.id;

    //Check for published Blog
    const publishedBlog = await Blog.findOne({user : req.user.id})

    //if the user is not an admin then he/she is limited to a Blog
    if (publishedBlog && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The User with id of ${req.user.id} has already published a blog`,404))
    }

    Blog.create(req.body).then((info) => res.status(201).json({success : true, message : info})).catch(err => next(err))
    //res.status(200).json({success : true, message : info})
}

//@desc Update Blog
//@route PUT /api/v1/Blog/:id
//@access Private

exports.updateBlog = (req, res, next) => {
    Blog.findById(req.params.id).then((info) =>{
        if(!info){
            return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`,404))
        }
        if(info.user.toString()!==req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.name} is not authorized to update this Blog`,401))
        }
        Blog.findByIdAndUpdate(req.params.id,req.body,{
            new : true,
            runValidators : true
        }).then(data => res.status(200).json({success : true, message : data})).catch(err => next(err))
        }).catch(err => next(err))
}

//@desc Delete Blog
//@route DELETE /api/v1/Blog/:id
//@access Private

exports.deleteBlog = async(req, res, next) => {
    try{
    let blog = await Blog.findById(req.params.id)
    if(!blog){
        return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`,404))
    }
    if(blog.user.toString()!==req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.name} is not authorized to delete this Blog`,401))
    }
    blog.remove()
    res.status(200).json({success : true, message : 'deleted'})}
    catch(err){
        next(err)
    }
}


//@desc Upload photos for Blog
//@route GET /api/v1/Blog/:id/photo
//@access Private

exports.uploadPhotoBlog = (req, res, next) => {
    const file = req.files.file

    //Database stuffs
    Blog.findById(req.params.id).then((info) =>{
        if(info.user.toString()!==req.user.id && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.name} is not authorized to update this Blog`,401))
        }

        file.name = `photo_${info._id}${path.parse(file.name).ext}`

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
            if (err) {
                console.error(err);
                return next(new ErrorResponse(`Problem with file upload`,500))
            }
            Blog.findByIdAndUpdate(req.params.id,{photo : file.name},{
                new : true,
                runValidators : true
            }).then(data => res.status(200).json({success : true, data : file.name}));
        })
        //
        if(!info){
            return next(new ErrorResponse(`Blog not found with id of ${req.params.id}`,404));
        }}).catch(err => next(err));
    //End of database stuffs

        //check if a file is present
        if(!req.files){
            return next(new ErrorResponse(`Please add a file`,400));
        }

        // make sure it is an image
        if (!file.mimetype.startsWith('image')) {
            return next(new ErrorResponse(`Please add an image file`,400))
        }

        // check file size
        if (file.size > process.env.MAX_FILE_SIZE) {
            return next(new ErrorResponse(`image size must not exceed ${process.env.MAX_FILE_SIZE}`,400))
        }
        
}