const mongoose = require("mongoose");

const inquiryModel = mongoose.Schema({
    projectName : {
        type : String,
        required : true,
    },
    phonenumber : {
        type : String
    },
    comment : String,
    inquiryDate : String,
    projectDate : String,
    status : String,
    customer : String
});

const inquiryData = new mongoose.model("inquiryData", inquiryModel);

module.exports = inquiryData;