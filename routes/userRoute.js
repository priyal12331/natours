const express =require('express');
const userController=require('./../Controllers/userController.js');
const authController=require('./../Controllers/authController.js');
const router=express.Router();

//const upload=multer({dest:'public/img/users'})
router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.get('/logout',authController.logout);
router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);
router.patch('/updatePassword',authController.protect,authController.updatePassword);

router.get('/me',authController.protect,userController.getMe,userController.getUser)
router.patch('/updateMe',authController.protect,userController.uploadUserPhoto,userController.updateMe);
router.delete('/deleteMe',authController.protect,userController.deleteMe);


 router
.route('/')
 .get(userController.getAllUsers)
// .post(userController.createUser);

// router
// .route('/:id')
// .get(userController.getUser)
// .patch(userController.updateUser)
// .delete(userController.deleteUser);

module.exports=router;