const express = require('express')
const router = express.Router()
const doctorController = require('../controllers/doctor-auth-controller')
const validator = require('../middlewares/validator-middleware')
const signupSchema = require('../validator/doctor-signup-validator')
const loginSchema = require('../validator/doctor-login-validator copy')
// const authMiddleware = require('../middlewares/auth-middleware')

router.get('/', doctorController.home)
router.post('/register',validator(signupSchema), doctorController.register)
router.post('/login',validator(loginSchema), doctorController.login)
router.post('/verify-otp', doctorController.verifyOtp)
router.post('/resend-otp', doctorController.resendOtp)


// router.get('/get-user',authMiddleware,authController.getUser)




module.exports = router