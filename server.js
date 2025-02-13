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
const { addDataToArea, removeDataFromArea, getDataFromArea, updateDataOfArea } = require("./controllers/sheets/Area Sheets/areasheets");
const { addNewProduct, deleteSingleProduct, updateSingleProduct, getSingleProducts } = require("./controllers/sheets/Product Sheets/productsheets");
const { addProductGroup, deleteProductGroup, updateProductGroup, getAllProductGroups } = require("./controllers/sheets/Product Sheets/productgroupsheets");
const { getAllStores, addStore, deleteStore, updateStores } = require("./controllers/sheets/stores/storesheet");
const { getAllTailors, addTailor, deleteTailor, updateTailor } = require("./controllers/sheets/Tailor Sheets/tailorsheet");
const { getBrands, addBrand, deleteBrand, updateBrand } = require("./controllers/sheets/Brand Sheets/brandsheets");
const { getCatalogues, addCatalogue, deleteCatalogue, updateCatalogue } = require("./controllers/sheets/Catalogue Sheets/cataloguesheets");

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

//area data routes
app.post("/addareadata", addDataToArea);
app.post("/removedatafromarea", removeDataFromArea);
app.post("/getdatafromarea", getDataFromArea);
app.post("/updatedataofarea", updateDataOfArea);

//product routes
app.post("/addnewproduct", addNewProduct);
app.post("/deletesingleproduct", deleteSingleProduct);
app.post("/updatesingleproduct", updateSingleProduct);
app.get("/getsingleproducts", getSingleProducts);

//productgroup routes
app.post("/addproductgroup", addProductGroup);
app.post("/deleteproductgroup", deleteProductGroup);
app.post("/updateproductgroup", updateProductGroup);
app.get("/getallproductgroup", getAllProductGroups);

//store database routes
app.get("/getallstores", getAllStores);
app.post("/addstore", addStore);
app.post("/deletestore", deleteStore);
app.post("/updatestore", updateStores);

//tailors database routes
app.get("/gettailors", getAllTailors);
app.post("/addtailor", addTailor);
app.post("/deletetailor", deleteTailor);
app.post("/updatetailor", updateTailor);

// brand routes
app.get("/getbrands", getBrands);
app.post("/addbrand", addBrand);
app.post("/deletebrand", deleteBrand);
app.post("/updatebrand", updateBrand);

// catalogue routes
app.get("/getcatalogues", getCatalogues);
app.post("/addcatalogue", addCatalogue);
app.post("/deletecatalogue", deleteCatalogue);
app.post("/updatecatalogue", updateCatalogue);

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port : ${process.env.PORT}`);
    connectDB();
})