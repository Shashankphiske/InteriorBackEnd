const  { User } = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { generateTokenAndSetCookie } = require("../utils/generateTokenAndSetCookie");

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try{
        const user = await User.findOne({email});

        if(!user){
            console.log("User not found");
            return res.status(400).json({
                success : false,
                message : "Incorrect email or password",
            });
        }
        const userpass = await user.password;

        const ispassvalid = await bcrypt.compare(password, userpass);
        
        if(ispassvalid == false){
            console.log("Invalid password");
            return res.status(400).json({
                success : false,
                message : "Invalid Credentials",
            });
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastlogin = Date.now();
        await user.save();

        return res.status(200).json({
            success : true,
            message : "User login successfull",
            user : {
                ...user._doc,
                password : null,
            }
        })
    }
    catch (error){
        console.log("error in login :",error);
        return res.status(500).json({
            success : false,
            message : "Internal server error",
        })
    }
}

const logout = async (req, res) => {
    
    try{
        res.clearCookie("token");
        return res.status(200).json({
            success : true,
            message : "Logout success",
        })    
    }
    catch(error){
        console.log("Error in logout :", error);
        return res.status(500).json({
            success : false,
            message : "Server error",
        })
    }
}

module.exports = { loginUser, logout };