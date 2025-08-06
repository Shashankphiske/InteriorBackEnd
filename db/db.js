const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try{
        const con = await mongoose.connect("mongodb+srv://sheeladecor:sheeladecor@cluster0.lg5aj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        console.log(`Mongodb connected : ${con.connection.host}`)
    }
    catch (error){
        console.log("Error in db connection :", error);
        process.exit(1);
    }
}

module.exports = { connectDB };