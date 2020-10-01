const express = require('express');
const cors = require('cors');
const {getBlogs , getBlog, createBlog, updateBlog, deleteBlog,uploadPhotoBlog} = require('../controllers/blog');
const Blog = require('../models/Blog');



const {protect,authorize} = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');


const router = express.Router();

router.use(cors())
router.route('/:id/photo').put(protect ,authorize('publisher','admin'), uploadPhotoBlog);
router.route('/blog').get(advancedResults(Blog),getBlogs).post(protect,authorize('publisher','admin') ,createBlog);
router.route('/blog/:id').get(getBlog).put(protect,authorize('publisher','admin') ,updateBlog).delete(protect,authorize('publisher','admin'),deleteBlog);

module.exports = router