const express=require('express');
const router=express.Router();
const viewsController=require('./../Controllers/viewsController')
const authController=require('./../Controllers/authController')

//router.use(authController.isLoggedIn)

router.get('/',authController.isLoggedIn,viewsController.getOverview)
router.get('/tour/:slug',authController.isLoggedIn,viewsController.getTour)
router.get('/login',authController.isLoggedIn,viewsController.login)
router.get('/me',authController.protect,viewsController.getAccount)
module.exports=router