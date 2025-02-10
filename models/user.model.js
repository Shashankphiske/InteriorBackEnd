const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    name : {
        type : String,
        required : true,
    },
    lastlogin : {
        type : Date,
        default : Date.now,
    },
    verified : {
        type : Boolean,
        default : false,
    },
    resetPasswordToken : String,
    resetPasswordTokenExpiresAt : { type : Date},
    verificationToken : String,
    verificationTokenExpiresAt : { type : Date, expires : 900 },

}, {timestamps : true});

const User = mongoose.model("User", userSchema);

module.exports = { User };