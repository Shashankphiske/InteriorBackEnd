const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

const checkAuth = async (req, res) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(400).json({
            success : false,
            message : "Unauthorized user",
        });
    }

    try{

        const decoded = jwt.verify(token, process.env.SECRET)

        if(!decoded){
            return res.status(400).json({
                success : false,
                message : "Unauthorized user"
            });
        }
        
        const id = decoded.id;
        const exp = decoded.exp;
        const user = await User.findOne({_id : id});

        if(!user){
            return res.status(400).json({
                success : false,
                message : "Unauthorized user",
            })
        }

        const time = user.lastlogin;

        if(exp < time/1000){
            return res.status(400).json({
                success : false,
                message : "Session expires, please login again",
            });
        }

        return res.status(200).json({
            success : true,
            message : "received",
            body : {
                ...user._doc,
                password : null
            }
        })
    }
    catch(error){
        console.log("Unauthorized user :", error);
        return res.status(400).json({
            success : false,
            message : "Unauthorized user",
        });
    }
}

const checkAuthLogout = async (req, res) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(200).json({
            success : true,
            message : "User logged out proceed"
        });
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    if(!decoded){
        return res.status(200).json({
            success : true,
            message : "User logged out proceed",
        });
    }

    const user = await User.findOne({_id : decoded.id});

    if(!user){
        return res.status(200).json({
            success : true,
            message : "User logged out proceed",
        });
    }

    return res.status(400).json({
        success : false,
        message : "Please log out then proceed",
    });
    
}

module.exports = { checkAuth, checkAuthLogout };