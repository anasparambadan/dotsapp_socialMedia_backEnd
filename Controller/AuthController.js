import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import otpVerificationModel from "../Models/otpVerificationModel.js";
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()
//sign up user
export const registerUser = async (req, res) => {


    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(req.body.password, salt)
    req.body.password = hashedpassword

    const newUser = new UserModel(req.body)
    const { userName } = req.body

    try {
        const odlUser = await UserModel.findOne({ userName })
        if (odlUser) {
            return res.status(400).json({ message: "User name is already registered" })
        }
        const user = await newUser.save()
        
        const otpSend = await sendOtpVerificaionEmail(user, res)

        const token = jwt.sign({
            username: user.userName, id: user._id
        }, process.env.JWT_KEY, { expiresIn: '10m' })

        res.status(200).json({ user, token })

    } catch (error) {
        res.status(500).json({ message: error.message })

    }

};

//user login

export const loginUser = async (req, res) => {
    console.log(req.body,'req.body.............')
    const { userName, password } = req.body;
    console.log(userName,password ,'at lgoinn usree controller......./////////////')

    try {
        const user = await UserModel.findOne({ userName: userName })
        console.log(user,'user at authcontromller............')

        if (user) {
            const validity = await bcrypt.compare(password, user.password)

            if (!validity) {
                {
                    res.status(400).json("Either password or user name is incorrect")
                }
            }
            else {
                const token = jwt.sign({
                    username: user.userName, id: user._id
                }, process.env.JWT_KEY, { expiresIn: '1h' })
                
                res.status(200).json({ user, token })
            }
        }
        else {
            res.status(404).json("User does not exist")
        }
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

//otp email verification

export const otpVerify = async(req,res)=>{
    try {
        let {userId,otp} = req.body
        console.log(userId,otp, 'userid and otp at authcontroller')
        if(!userId || !otp){
            throw Error('Empty otp details are not allowed')
        }
        else{
            const otpVerificationData = await otpVerificationModel.find({userId})
            console.log(otpVerificationData, "otp verification data")
            if(otpVerificationData){
                const {expiresAt} = otpVerificationData[0];
                const hashedOtp = otpVerificationData[0].otp;
                console.log(hashedOtp,'hashed otp')

                if(expiresAt < Date.now()){
                    await otpVerificationModel.deleteMany({userId})
                    throw new Error("OTP expires. Please request again")
                }
                else{
                    console.log(otp,hashedOtp,'otp,hashedotp')
                    const vaildOtp =  await bcrypt.compare(otp, hashedOtp)
                    if(!vaildOtp){
                        throw new Error(" Invalied otp. check and Enter correct OTP")
                    }
                    else{
                        console.log('else ccase otp valid')
                        await UserModel.updateOne({_id:userId}, {verified:true});
                        await otpVerificationModel.deleteMany({userId})
                        const user = await UserModel.findOne({_id:userId})
                        console.log(user,'user at otpverify....')
                        
                        const token = jwt.sign({
                            username: user.userName, id: user._id
                        }, process.env.JWT_KEY, { expiresIn: '1h' })
                        
                        res.status(200).json({ user, token })
                        
                       
                    }

                }
            }
        }
    } catch (error) {
        res.json({
            status:"Failed",
            message: error.message
        })
    }
}

export const resendOtp = async(req,res)=>{
    try {
        let{userId,userName} = req.body
        if(!userId || !userName){
            throw Error("Empty user details")
        }
        else{
            await otpVerificationModel.deleteMany({userId});
            sendOtpVerificaionEmail({_id:userId, userName}, res)

        }
    } catch (error) {
        res.json({
            status:"Failed",
            message:error.message
        })
    }
}

const sendOtpVerificaionEmail = async ({ _id, userName }, res) => {
    console.log(_id,userName,'id and user namea at sendotpverifunction.............')
    const email = process.env.EMAIL
    const password = process.env.NDMILR_PASS
    console.log(email,password,'email and password at otpverify................')
    return new Promise(async (resolve, reject) => {

        try {

            const otp = `${Math.floor(1000 + Math.random() * 9000)}`
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.NDMILR_PASS
                }
               
            });

            console.log(_id,userName,'id and user namea at sendotpverifunction22222222222.............')
            const mailOptions = {
                
                from: process.env.EMAIL,
                to: userName,
                subject: 'Subject',
                text: 'Email content',
                html: `<p>The OTP to verify your emai is <b>${otp}</b>. Ignore this mail if this is not done by you. </p>`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    
                }
            });

            resolve({
                status: "pending",
                message: "verification otp mail is send",
                data: {
                    userId: _id,
                    email: userName
                }
            })
            const saltRound = 10;
            const hashedOtp = await bcrypt.hash(otp, saltRound);
            const newOtpVerification = await new otpVerificationModel({
                userId: _id,
                otp: hashedOtp,
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,
            });
            await newOtpVerification.save();
            await transporter.sendMail(mailOptions);


        } catch (error) {
            reject({
                status: "otp send failed",
                message: error.message
            })
        }
    })
}



