const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema({
    title : {
        type : String,
        required : [true,'Please add a title'],
        unique : true,
        trim : true
    },
    slug : String,
    description :{
        type : String,
        required : [true,'Please add a description'],
        maxlength : [500, 'Description is too long']
    },
    photo : {
        type: String,
        default : 'no photo'
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    content : {
        type : String,
        required : [true,'Please add blog content']
    },
    keywords:{
        type : String
    },
    createdAt : {
        type : Date,
        default : Date.now,
    }
})

BlogSchema.pre('save', function(next){
    this.slug = slugify(this.title,{lower : true})
    next()
})





module.exports = mongoose.model('Blog', BlogSchema)