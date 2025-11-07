import express from 'express';
import {isAuthenticated, login, logout, register, sendPasswordResetOTP, sendVerifyOtp, verifyEmail} from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-email', userAuth, verifyEmail);
authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-password-reset-otp', userAuth, sendPasswordResetOTP);

export default authRouter;