const express = require("express");
const serverless = require("serverless-http");
require("dotenv").config();
const loginrouter = require("../../routes/login");
const { connectDB } = require("../../db/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const { checkAuth, checkAuthLogout } = require("../../controllers/auth.checkUser");
const { sendProjectData, getProjectData, updateProjectValues, deleteProjectData } = require("../../controllers/sheets/projectsheets");
const { sendCustomerData, deleteCustomerData, getCustomerData } = require("../../controllers/sheets/customersheets");
const { sendInteriorData, getInteriorData, deleteInteriorData, updateInteriorData } = require("../../controllers/sheets/interiorsheets");
const { sendSalesAssociateData, getSalesAssociateData, deleteSalesAssociateData } = require("../../controllers/sheets/salesAssociatesheets");
const { addDataToArea, removeDataFromArea, getDataFromArea, updateDataOfArea } = require("../../controllers/sheets/Area Sheets/areasheets");
const { addNewProduct, deleteSingleProduct, updateSingleProduct, getSingleProducts } = require("../../controllers/sheets/Product Sheets/productsheets");
const { addProductGroup, deleteProductGroup, updateProductGroup, getAllProductGroups } = require("../../controllers/sheets/Product Sheets/productgroupsheets");
const { getAllStores, addStore, deleteStore, updateStores } = require("../../controllers/sheets/stores/storesheet");
const { getAllTailors, addTailor, deleteTailor, updateTailor } = require("../../controllers/sheets/Tailor Sheets/tailorsheet");
const { getBrands, addBrand, deleteBrand, updateBrand } = require("../../controllers/sheets/Brand Sheets/brandsheets");
const { getCatalogues, addCatalogue, deleteCatalogue, updateCatalogue } = require("../../controllers/sheets/Catalogue Sheets/cataloguesheets");
const { getTasks, addTask, updateTask, deleteTask } = require("../../controllers/sheets/Task Sheets/tasksheet");

const corsOptions = {
    origin: process.env.NODE_ENV === "production"
      ? "http://localhost:5173" // Your frontend domain in production
      : "https://sheeladecor.netlify.app", // Local dev
    methods: "POST, PUT, GET, DELETE, PATCH, HEAD",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true, // Allow cookies
  };

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Origin",
      process.env.NODE_ENV === "production"
      ? "http://localhost:5173"
        : "https://sheeladecor.netlify.app"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });

connectDB();

app.get("/.netlify/functions/server", (req, res) => {
    res.send("App running");
})


app.use("/.netlify/functions/server/auth", loginrouter);

app.get("/.netlify/functions/server/checkAuth", checkAuth);
app.get("/.netlify/functions/server/checklogout", checkAuthLogout);

app.post("/.netlify/functions/server/sendprojectdata", sendProjectData);
app.get("/.netlify/functions/server/getprojectdata", getProjectData);
app.post("/.netlify/functions/server/updateprojectdata", updateProjectValues);

//customerdata routes
app.post("/.netlify/functions/server/sendcustomerdata", sendCustomerData);
app.post("/.netlify/functions/server/deletecustomerdata", deleteCustomerData);
app.get("/.netlify/functions/server/getcustomerdata", getCustomerData);
app.post("/.netlify/functions/server/deleteprojectdata", deleteProjectData);

//interior person data
app.post("/.netlify/functions/server/sendinteriordata", sendInteriorData);
app.get("/.netlify/functions/server/getinteriordata", getInteriorData);
app.post("/.netlify/functions/server/deleteinteriordata", deleteInteriorData);
app.post("/.netlify/functions/server/updateinteriordata", updateInteriorData);

//sales associate data
app.post("/.netlify/functions/server/sendsalesassociatedata", sendSalesAssociateData);
app.get("/.netlify/functions/server/getsalesassociatedata", getSalesAssociateData);
app.post("/.netlify/functions/server/deletesalesassociatedata", deleteSalesAssociateData);

//area data routes
app.post("/.netlify/functions/server/addareadata", addDataToArea);
app.post("/.netlify/functions/server/removedatafromarea", removeDataFromArea);
app.post("/.netlify/functions/server/getdatafromarea", getDataFromArea);
app.post("/.netlify/functions/server/updatedataofarea", updateDataOfArea);

//product routes
app.post("/.netlify/functions/server/addnewproduct", addNewProduct);
app.post("/.netlify/functions/server/deletesingleproduct", deleteSingleProduct);
app.post("/.netlify/functions/server/updatesingleproduct", updateSingleProduct);
app.get("/.netlify/functions/server/getsingleproducts", getSingleProducts);

//productgroup routes
app.post("/.netlify/functions/server/addproductgroup", addProductGroup);
app.post("/.netlify/functions/server/deleteproductgroup", deleteProductGroup);
app.post("/.netlify/functions/server/updateproductgroup", updateProductGroup);
app.get("/.netlify/functions/server/getallproductgroup", getAllProductGroups);

//store database routes
app.get("/.netlify/functions/server/getallstores", getAllStores);
app.post("/.netlify/functions/server/addstore", addStore);
app.post("/.netlify/functions/server/deletestore", deleteStore);
app.post("/.netlify/functions/server/updatestore", updateStores);

//tailors database routes
app.get("/.netlify/functions/server/gettailors", getAllTailors);
app.post("/.netlify/functions/server/addtailor", addTailor);
app.post("/.netlify/functions/server/deletetailor", deleteTailor);
app.post("/.netlify/functions/server/updatetailor", updateTailor);

// brand routes
app.get("/.netlify/functions/server/getbrands", getBrands);
app.post("/.netlify/functions/server/addbrand", addBrand);
app.post("/.netlify/functions/server/deletebrand", deleteBrand);
app.post("/.netlify/functions/server/updatebrand", updateBrand);

// catalogue routes
app.get("/.netlify/functions/server/getcatalogues", getCatalogues);
app.post("/.netlify/functions/server/addcatalogue", addCatalogue);
app.post("/.netlify/functions/server/deletecatalogue", deleteCatalogue);
app.post("/.netlify/functions/server/updatecatalogue", updateCatalogue);

// tasks routes
app.get("/.netlify/functions/server/gettasks", getTasks);
app.post("/.netlify/functions/server/addtask", addTask);
app.post("/.netlify/functions/server/updatetask", updateTask);
app.post("/.netlify/functions/server/deletetask", deleteTask);

module.exports.handler = serverless(app); 