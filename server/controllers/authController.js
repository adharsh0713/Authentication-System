import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async(req, res) => {
    const {name, email, password} = req.body;

    if (!name || !email || !password){
        return res.json({success: false, message: "Missing Details"});
    }

    try {
        const existingUser = await userModel.findOne({email});
        if (existingUser){
            return res.json({success: false, message: "User already exists!"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({name, email, password: hashedPassword});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7D'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Security Portal!",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Welcome, ${name}!</h2>
                    <p>Your account has been successfully created with the email:</p>
                    <p><b>${email}</b></p>
                    <p>We're thrilled to have you at <b>Security Portal</b>. Explore, stay protected, and make the most of our features.</p>
                    <br>
                    <p>Best regards,<br><b>The Security Portal Team</b></p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password){
        return res.json({success: false, message: "Email and Password are required"});
    }

    try {
        const user = await userModel.findOne({email});
        if (!user) {
            return res.json({success: false, message: "Invalid E-mail"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch){
            return res.json({success: false, message: "Invalid Password"});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7D'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({success: true});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({success: true, message: "Logged Out"});
    } catch{
        return res.json({success: false, message: error.message})
    }
}

//send email verification otp
export const sendVerifyOtp = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.isAccountVerified) {
            return res.json({success: false, message: "Account already verified."})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOTP = otp;
        user.verifyOTPExpireAt = Date.now() + 5 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "OTP - Email Verification",
            html: `
                <h2>Hello ${user.name},</h2>
                <p>Your One-Time Password (OTP) for verifying your email <b>${user.email}</b> is:</p>
                <h1 style="color:#007bff;">${otp}</h1>
                <p>This code will expire in <b>5 minutes</b>.</p>
                <br/>
                <p>– Authentication System</p>
            `
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true, message: `Verification OTP sent on email: ${user.email}`});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

//verify email using otp
export const verifyEmail = async (req, res) => {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!userId || !otp) {
        return res.json({success: false, message: "Missing Details"});
    }

    try {
        const user = await userModel.findById(userId);

        if (!user){
            return res.json({success: false, message: "No user found"});
        }

        if (user.verifyOTP === '' || user.verifyOTP !== otp){
            return res.json({success: false, message: "Invalid OTP"})
        }

        if(user.verifyOTPExpireAt < Date.now()){
            return res.json({success: false, message: "OTP expired"})
        }

        user.isAccountVerified = true;

        user.verifyOTP = '';
        user.verifyOTPExpireAt = 0;

        await user.save();

        return res.json({success: true, message: "E-mail verified successfully"})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

//check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true})
    } catch (error) {
        return res.json({ success: false, message: error.message})
    }
}

//send password reset otp
export const sendPasswordResetOTP = async (req, res) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.json({ success: false, message: "E-mail is required"})
        }

        const user = await userModel.findOne({email});
        if (!user){
            return res.json({ success: false, message: "User not found"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOTP = otp;
        user.resetOTPExpireAt = Date.now() + 5 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "OTP- for Password Reset",
            html: `
                <h2>Hello ${user.name},</h2>
                <p>Your One-Time Password (OTP) for resetting your password <b>${email}</b> is:</p>
                <h1 style="color:#007bff;">${otp}</h1>
                <p>This code will expire in <b>5 minutes</b>.</p>
                <br/>
                <p>– Authentication System</p>
            `
        }
        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: `OTP to reset password is sent to email ${email}`})
    } catch (error) {
        return res.json({ success: false, message: error.message})
    }
}

//reset user password
export const resetPassword = async (req, res) => {

}