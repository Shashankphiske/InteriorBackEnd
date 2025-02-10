const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        const con = await mongoose.connect(process.env.CONNECTION)
        console.log(`Mongodb connected : ${con.connection.host}`)
    }
    catch (error){
        console.log("Error in db connection :", error);
        process.exit(1);
    }
}

module.exports = { connectDB };