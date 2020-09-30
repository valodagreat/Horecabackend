const express = require('express');
const {getBlogs , getBlog, createBlog, updateBlog, deleteBlog,uploadPhotoBlog} = require('../controllers/Blog');
const Blog = require('../models/Blog');



const {protect,authorize} = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');


const router = express.Router();

router.route('/:id/photo').put(protect ,authorize('publisher','admin'), uploadPhotoBlog);
router.route('/blog').get(advancedResults(Blog),getBlogs).post(protect,authorize('publisher','admin') ,createBlog);
router.route('/blog/:id').get(getBlog).put(protect,authorize('publisher','admin') ,updateBlog).delete(protect,authorize('publisher','admin'),deleteBlog);

module.exports = router