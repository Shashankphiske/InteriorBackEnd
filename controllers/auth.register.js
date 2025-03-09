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

            return res.status(400).json({
                success : false,
                message : "All fields are required",
            });
            throw new Error("All fields are required");
        }
        const userExists = await User.findOne({email});
        if(userExists){

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

        return res.status(500).json({
            success : false,
            message : "Internal server error",
        });
    }
}

const verifyUser = async (req, res) => {

    const { code } = req.body;
    const cookie = req.cookies.token;

    // Check if token exists
    if (!cookie) {
        console.log("No cookie")
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided",
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(cookie, process.env.SECRET);
    } catch (err) {
        console.log("Unauthorized");
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token",
        });
    }

    try {
        console.log(decoded.id);
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
            _id: decoded.id,
        });

        if (!user) {
            console.log("no user")
            return res.status(400).json({
                success: false,
                message: "Invalid or expired code",
            });
        }

        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);
        console.log("Welcome mail sent successfully");

        return res.status(200).json({
            success: true,
            message: "Welcome mail sent successfully",
            user,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error in email validation",
        });
    }
};


module.exports = { registerUser, verifyUser };