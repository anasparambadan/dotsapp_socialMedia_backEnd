import express from 'express'
import { loginUser, otpVerify, registerUser, resendOtp } from '../Controller/AuthController.js';

const router = express.Router();

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/otpVerify',otpVerify)
router.post('/resendOtp',resendOtp)

router.post('/adminLogin',loginUser)

export default router;