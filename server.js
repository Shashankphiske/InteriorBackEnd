const express = require("express");
require("dotenv").config();
const loginrouter = require("./routes/login");
const { connectDB } = require("./db/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const { checkAuth, checkAuthLogout } = require("./controllers/auth.checkUser");
const { sendProjectData, getProjectData, updateProjectValues, deleteProjectData } = require("./controllers/sheets/projectsheets");
const { sendCustomerData, deleteCustomerData, getCustomerData } = require("./controllers/sheets/customersheets");
const { sendInteriorData, getInteriorData, deleteInteriorData } = require("./controllers/sheets/interiorsheets");
const { sendSalesAssociateData, getSalesAssociateData, deleteSalesAssociateData } = require("./controllers/sheets/salesAssociatesheets");

const corsOptions = {
    origin : "http://localhost:5174",
    mehtods : "POST, PUT, GET, DELETE, PATCH, HEAD",
    credentials : true,
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));

app.use("/auth", loginrouter);

app.get("/checkAuth", checkAuth);
app.get("/checklogout", checkAuthLogout);

app.post("/sendprojectdata", sendProjectData);
app.get("/getprojectdata", getProjectData);
app.post("/updateprojectdata", updateProjectValues);

//customerdata routes
app.post("/sendcustomerdata", sendCustomerData);
app.post("/deletecustomerdata", deleteCustomerData);
app.get("/getcustomerdata", getCustomerData);
app.post("/deleteprojectdata", deleteProjectData);

//interior person data
app.post("/sendinteriordata", sendInteriorData);
app.get("/getinteriordata", getInteriorData);
app.post("/deleteinteriordata", deleteInteriorData);

//sales associate data
app.post("/sendsalesassociatedata", sendSalesAssociateData);
app.get("/getsalesassociatedata", getSalesAssociateData);
app.post("/deletesalesassociatedata", deleteSalesAssociateData);

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port : ${process.env.PORT}`);
    connectDB();
})