const express = require('express')
const router = express.Router()
const doctorController = require('../controllers/doctor-auth-controller')
const validator = require('../middlewares/validator-middleware')
const signupSchema = require('../validator/doctor-signup-validator')
const loginSchema = require('../validator/doctor-login-validator')
const { authLimiter, registerLimiter } = require('../middlewares/rate-limit-middleware')
// const authMiddleware = require('../middlewares/auth-middleware')

router.get('/', doctorController.home)
router.post('/register', registerLimiter, validator(signupSchema), doctorController.register)
router.post('/login', authLimiter, validator(loginSchema), doctorController.login)
router.post('/verify-otp', authLimiter, doctorController.verifyOtp)
router.post('/resend-otp', authLimiter, doctorController.resendOtp)


// router.get('/get-user',authMiddleware,authController.getUser)




module.exports = router