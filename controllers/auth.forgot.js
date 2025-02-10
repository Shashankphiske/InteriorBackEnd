const { User } = require("../models/user.model");
const crypto = require("crypto");
const { sendForgotPasswordMail, sendPasswordResetSuccessMail } = require("../mail/forgotpassmails");
const bcrypt = require("bcryptjs");

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try{
        const user = await User.findOne({ email });

        if(!user){
            console.log("User does'nt exist");
            return res.status(400).json({
                success : false,
                message : "User does'nt exist or invalid email",
            });
        }
    
        const resetPasswordToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordTokenExpiresAt = Date.now() + 15 * 60 * 1000;
    
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;
    
        await user.save();
    
        await sendForgotPasswordMail(resetPasswordToken, user.email);
    
        return res.status(200).json({
            success : true,
            message : "Password reset mail sent successfully",
        });
    }
    catch (error){
        console.log("Error in sending password reset mail :", error);
        return res.status(500).json({
            success : false,
            message : "Password reset mail unsuccessfull"
        });
    }
}

const passwordReset = async (req, res) => {
    const { password, token } = req.body;

    try{
        const user = await User.findOne({
            resetPasswordToken : token,
            resetPasswordTokenExpiresAt : { $gt : Date.now()}
        });

        if(!user){
            console.log("Password reset timeout");
            return res.status(400).json({
                success : false,
                message : "Password reset timeout",
            });
        }

        const hashedpass = await bcrypt.hash(password, 10);

        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;
        user.password = hashedpass;

        await user.save();

        await sendPasswordResetSuccessMail(user.email, user.name);

        console.log("Password reset success");

        return res.status(200).json({
            success : true,
            message : "Password reset successfull",
        });
    }
    catch (error){
        console.log("Error in resetting password");
        return res.status(500).json({
            success : false,
            message : "Error in resetting password",
        });
    }
}

module.exports = { forgotPassword,passwordReset };