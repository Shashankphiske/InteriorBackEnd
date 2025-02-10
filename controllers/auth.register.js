const { User } = require("../models/user.model");
const { generateVerificationToken } = require("../utils/generateVerificationToken");
const { generateTokenAndSetCookie } = require("../utils/generateTokenAndSetCookie");
const bcrypt = require("bcryptjs");
const { sendVerificationMail, sendWelcomeEmail } = require("../mail/registermails");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    const { email, name, password } = req.body;

    try{
        if(!email || !name || !password){
            console.log("All fields are required");
            return res.status(400).json({
                success : false,
                message : "All fields are required",
            });
            throw new Error("All fields are required");
        }
    
        const userExists = await User.findOne({email});
        if(userExists){
            console.log("User already exists with the specified email address");
            return res.status(400).json({
                success : false,
                message : "User already exists with the specified email address",
            });
            throw new Error("User exists");
        }
    
        const verificationToken = generateVerificationToken();
        const verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000;
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = new User({
            email :email,
            password : hashedPassword,
            name : name,
            verificationToken : verificationToken,
            verificationTokenExpiresAt : verificationTokenExpiresAt,
        });
    
        await user.save();
    
        generateTokenAndSetCookie(res, user._id);
    
        await sendVerificationMail(user.email, verificationToken);
    
        return res.status(200).json({
            success : true,
            message : "Verification email sent successfully",
        });
    }
    catch (error){
        console.log("Error in auth.register.js :", error);
        return res.status(500).json({
            success : false,
            message : "Internal server error",
        });
    }
}

const verifyUser = async (req, res) => {
    const { code } = req.body;
    const cookie = req.cookies.token;

    const decoded = jwt.verify(cookie, process.env.SECRET);
    
    try{
        const user = await User.findOne({
            verificationToken : code,
            verificationTokenExpiresAt : { $gt : Date.now() },
            _id : decoded.id,
        });

        if(!user){
            console.log("Invalid code or user doesnt exist");
            return res.status(400).json({
                success : false,
                message : "Invalid or expired code",
            });
        }
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        console.log("Welcome mail sent successfully");
        return res.status(200).json({
            success : true,
            message : "Welcome mail sent successfully",
            user : {
                ...user._doc,
                password : null,
            }
        });

    }
    catch (error){
        console.log("Error in user verification");
        return res.status(500).json({
            success : false,
            message : "Internal server error in email validation",
        })
    }
}

module.exports = { registerUser, verifyUser };