const express = require('express');
const {getUsers, getUser, createUser , updateUser, deleteUser} = require('../controllers/user')
const xss = require('xss-clean');
const router = express.Router();
const User = require('../models/User');

const advancedResults = require('../middleware/advancedResults')
const {protect,authorize} = require('../middleware/auth');

//Prevent xss attack
router.use(xss());
router.use(protect);
router.use(authorize('admin'));

router
    .route('/admin')
        .get(advancedResults(User),getUsers)
        .post(createUser);
        

router
    .route('/admin/:id')
        .get(getUser)
        .put(updateUser)
        .delete(deleteUser);


module.exports = router;