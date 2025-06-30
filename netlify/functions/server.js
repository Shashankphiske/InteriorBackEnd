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
const { sendProjectData, getProjectData, updateProjectValues, deleteProjectData, updateProjectPayment } = require("../../controllers/sheets/projectsheets");
const { sendCustomerData, deleteCustomerData, getCustomerData, updateCustomerData } = require("../../controllers/sheets/customersheets");
const { sendInteriorData, getInteriorData, deleteInteriorData, updateInteriorData } = require("../../controllers/sheets/interiorsheets");
const { sendSalesAssociateData, getSalesAssociateData, deleteSalesAssociateData, updateSalesAssociateData } = require("../../controllers/sheets/salesAssociatesheets");
const { addDataToArea, removeDataFromArea, getDataFromArea, updateDataOfArea } = require("../../controllers/sheets/Area Sheets/areasheets");
const { addNewProduct, deleteSingleProduct, updateSingleProduct, getSingleProducts, addImportedProducts } = require("../../controllers/sheets/Product Sheets/productsheets");
const { addProductGroup, deleteProductGroup, updateProductGroup, getAllProductGroups } = require("../../controllers/sheets/Product Sheets/productgroupsheets");
const { getAllStores, addStore, deleteStore, updateStores } = require("../../controllers/sheets/stores/storesheet");
const { getAllTailors, addTailor, deleteTailor, updateTailor } = require("../../controllers/sheets/Tailor Sheets/tailorsheet");
const { getBrands, addBrand, deleteBrand, updateBrand } = require("../../controllers/sheets/Brand Sheets/brandsheets");
const { getCatalogues, addCatalogue, deleteCatalogue, updateCatalogue } = require("../../controllers/sheets/Catalogue Sheets/cataloguesheets");
const { getTasks, addTask, updateTask, deleteTask } = require("../../controllers/sheets/Task Sheets/tasksheet");
const { fetchPaymentData, updatePaymentData, sendPaymentData, deletePaymentData } = require("../../controllers/sheets/paymentsheet");
const { getAllAreas, sendAllAreas, deleteAreasData } = require("../../controllers/sheets/areas");
const { sendCompanyData, deleteCompanyData, getCompanyData } = require("../../controllers/companysheet");
const { getDesignData, sendDesignData, deleteDesignData } = require("../../controllers/designnosheet");
const { sendInquiryData, fetchInquiryData, updateInquiry, deleteInquiry } = require("../../controllers/inquirysheet");
const { getBankDetails, sendBankData, updateBankData, deleteBankData } = require("../../controllers/sheets/bankdetails");
const { getTermsDetails, sendTermsData, deleteTermsData } = require("../../controllers/sheets/termsdetails");
const { fetchPaintsInquiryData, sendPaintsInquiryData, updatePaintsInquiry, deletePaintsInquiry } = require("../../controllers/paints/paintsinquirysheet");
const { getPaintsBankDetails } = require("../../controllers/paints/paintsbanksheet");
const { getPaintsDesignData, sendPaintsDesignData, deletePaintsDesignData } = require("../../controllers/paints/paintsdesignsheet");
const { sendPaintsCompanyData, deletePaintsCompanyData, getPaintsCompanyData } = require("../../controllers/paints/paintscompanysheet");
const { getPaintsAllAreas, sendPaintsAllAreas, deletePaintsAreasData } = require("../../controllers/paints/paintsareas");
const { fetchPaintsPaymentData, updatePaintsPaymentData, sendPaintsPaymentData, deletePaintsPaymentData } = require("../../controllers/paints/paintspaymentssheet");
const { getPaintsTasks, addPaintsTask, updatePaintsTask, deletePaintsTask } = require("../../controllers/paints/paintstasksheet");
const { getPaintsBrands, addPaintsBrand, deletePaintsBrand, updatePaintsBrand } = require("../../controllers/paints/paintsbrandsheet");
const { getPaintsAllStores, addPaintsStore, deletePaintsStore, updatePaintsStores } = require("../../controllers/paints/paintsstoresheet");
const { addPaintsNewProduct, deletePaintsSingleProduct, updatePaintsSingleProduct, getPaintsSingleProducts, addPaintsImportedProducts } = require("../../controllers/paints/paintsproductsheet");
const { addPaintsDataToArea, removePaintsDataFromArea, getPaintsDataFromArea, updatePaintsDataOfArea } = require("../../controllers/paints/Area Sheets/paintsareasheet");
const { sendPaintsSalesAssociateData, getPaintsSalesAssociateData, deletePaintsSalesAssociateData, updatePaintsSalesAssociateData } = require("../../controllers/paints/paintssalesassociate");
const { sendPaintsInteriorData, getPaintsInteriorData, deletePaintsInteriorData, updatePaintsInteriorData } = require("../../controllers/paints/paintsinteriorshe");
const { sendPaintsCustomerData, deletePaintsCustomerData, getPaintsCustomerData, updatePaintsCustomerData } = require("../../controllers/paints/paintscustomershee");
const { sendPaintsProjectData, getPaintsProjectData, updatePaintsProjectValues, deletePaintsProjectData, updatePaintsProjectPayment } = require("../../controllers/paints/paintsprojectsheet");

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://furnishkaro.netlify.app",
      "http://localhost:5173",
      "http://51.21.200.25",
      "https://51.21.200.25",
      "https://sahanipaints.netlify.app"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "POST, PUT, GET, DELETE, PATCH, HEAD",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOptions));

// Keep your manual headers but update this:
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://furnishkaro.netlify.app",
    "http://localhost:5173",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
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
});

app.use("/.netlify/functions/server/auth", loginrouter);

app.get("/.netlify/functions/server/checkAuth", checkAuth);
app.get("/.netlify/functions/server/checklogout", checkAuthLogout);

app.post("/.netlify/functions/server/sendprojectdata", sendProjectData);
app.get("/.netlify/functions/server/getprojectdata", getProjectData);
app.post("/.netlify/functions/server/updateprojectdata", updateProjectValues);
app.post("/.netlify/functions/server/deleteprojectdata", deleteProjectData);
app.post("/.netlify/functions/server/updateprojectpayment", updateProjectPayment);

// paints project data
app.post("/.netlify/functions/server/sendpaintsprojectdata", sendPaintsProjectData);
app.get("/.netlify/functions/server/getpaintsprojectdata", getPaintsProjectData);
app.post("/.netlify/functions/server/updatepaintsprojectdata", updatePaintsProjectValues);
app.post("/.netlify/functions/server/deletepaintsprojectdata", deletePaintsProjectData);
app.post("/.netlify/functions/server/updatepaintsprojectpayment", updatePaintsProjectPayment);

//customerdata routes
app.post("/.netlify/functions/server/sendcustomerdata", sendCustomerData);
app.post("/.netlify/functions/server/deletecustomerdata", deleteCustomerData);
app.get("/.netlify/functions/server/getcustomerdata", getCustomerData);
app.post("/.netlify/functions/server/updatecustomerdata", updateCustomerData);

//paints customerdata routes
app.post("/.netlify/functions/server/sendpaintscustomerdata", sendPaintsCustomerData);
app.post("/.netlify/functions/server/deletepaintscustomerdata", deletePaintsCustomerData);
app.get("/.netlify/functions/server/getpaintscustomerdata", getPaintsCustomerData);
app.post("/.netlify/functions/server/updatepaintscustomerdata", updatePaintsCustomerData);

//interior person data
app.post("/.netlify/functions/server/sendinteriordata", sendInteriorData);
app.get("/.netlify/functions/server/getinteriordata", getInteriorData);
app.post("/.netlify/functions/server/deleteinteriordata", deleteInteriorData);
app.post("/.netlify/functions/server/updateinteriordata", updateInteriorData);

//paints interior person data
app.post("/.netlify/functions/server/sendpaintsinteriordata", sendPaintsInteriorData);
app.get("/.netlify/functions/server/getpaintsinteriordata", getPaintsInteriorData);
app.post("/.netlify/functions/server/deletepaintsinteriordata", deletePaintsInteriorData);
app.post("/.netlify/functions/server/updatepaintsinteriordata", updatePaintsInteriorData);

//sales associate data
app.post("/.netlify/functions/server/sendsalesassociatedata", sendSalesAssociateData);
app.get("/.netlify/functions/server/getsalesassociatedata", getSalesAssociateData);
app.post("/.netlify/functions/server/deletesalesassociatedata", deleteSalesAssociateData);
app.post("/.netlify/functions/server/updatesalesassociatedata", updateSalesAssociateData);

// paints sales associate data
app.post("/.netlify/functions/server/sendpaintssalesassociatedata", sendPaintsSalesAssociateData);
app.get("/.netlify/functions/server/getpaintssalesassociatedata", getPaintsSalesAssociateData);
app.post("/.netlify/functions/server/deletepaintssalesassociatedata", deletePaintsSalesAssociateData);
app.post("/.netlify/functions/server/updatepaintssalesassociatedata", updatePaintsSalesAssociateData);

//area data routes
app.post("/.netlify/functions/server/addareadata", addDataToArea);
app.post("/.netlify/functions/server/removedatafromarea", removeDataFromArea);
app.post("/.netlify/functions/server/getdatafromarea", getDataFromArea);
app.post("/.netlify/functions/server/updatedataofarea", updateDataOfArea);

//area paints data routes
app.post("/.netlify/functions/server/addpaintsareadata", addPaintsDataToArea);
app.post("/.netlify/functions/server/removepaintsdatafromarea", removePaintsDataFromArea);
app.post("/.netlify/functions/server/getpaintsdatafromarea", getPaintsDataFromArea);
app.post("/.netlify/functions/server/updatepaintsdataofarea", updatePaintsDataOfArea);

//product routes
app.post("/.netlify/functions/server/addnewproduct", addNewProduct);
app.post("/.netlify/functions/server/deletesingleproduct", deleteSingleProduct);
app.post("/.netlify/functions/server/updatesingleproduct", updateSingleProduct);
app.get("/.netlify/functions/server/getsingleproducts", getSingleProducts);
app.post("/.netlify/functions/server/importproducts", addImportedProducts);

// Paints product routes
app.post("/.netlify/functions/server/addpaintsnewproduct", addPaintsNewProduct);
app.post("/.netlify/functions/server/deletepaintssingleproduct", deletePaintsSingleProduct);
app.post("/.netlify/functions/server/updatepaintssingleproduct", updatePaintsSingleProduct);
app.get("/.netlify/functions/server/getpaintssingleproducts", getPaintsSingleProducts);
app.post("/.netlify/functions/server/importpaintsproducts", addPaintsImportedProducts);

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

// Paints store database routes
app.get("/.netlify/functions/server/getpaintsallstores", getPaintsAllStores);
app.post("/.netlify/functions/server/addpaintsstore", addPaintsStore);
app.post("/.netlify/functions/server/deletepaintsstore", deletePaintsStore);
app.post("/.netlify/functions/server/updatepaintsstore", updatePaintsStores);

// brand routes
app.get("/.netlify/functions/server/getbrands", getBrands);
app.post("/.netlify/functions/server/addbrand", addBrand);
app.post("/.netlify/functions/server/deletebrand", deleteBrand);
app.post("/.netlify/functions/server/updatebrand", updateBrand);

// Paints brand routes
app.get("/.netlify/functions/server/getpaintsbrands", getPaintsBrands);
app.post("/.netlify/functions/server/addpaintsbrand", addPaintsBrand);
app.post("/.netlify/functions/server/deletepaintsbrand", deletePaintsBrand);
app.post("/.netlify/functions/server/updatepaintsbrand", updatePaintsBrand);

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

// Paints tasks routes
app.get("/.netlify/functions/server/getPaintstasks", getPaintsTasks);
app.post("/.netlify/functions/server/addPaintstask", addPaintsTask);
app.post("/.netlify/functions/server/updatePaintstask", updatePaintsTask);
app.post("/.netlify/functions/server/deletePaintstask", deletePaintsTask);

//tailors database routes
app.get("/.netlify/functions/server/gettailors", getAllTailors);
app.post("/.netlify/functions/server/addtailor", addTailor);
app.post("/.netlify/functions/server/deletetailor", deleteTailor);
app.post("/.netlify/functions/server/updatetailor", updateTailor);

// payment routes
app.get("/.netlify/functions/server/getPayments", fetchPaymentData);
app.post("/.netlify/functions/server/updatePayments", updatePaymentData);
app.post("/.netlify/functions/server/addPayment", sendPaymentData);
app.post("/.netlify/functions/server/deletePayment", deletePaymentData);

// paints payment routes
app.get("/.netlify/functions/server/getPaintsPayments", fetchPaintsPaymentData);
app.post("/.netlify/functions/server/updatePaintsPayments", updatePaintsPaymentData);
app.post("/.netlify/functions/server/addPaintsPayment", sendPaintsPaymentData);
app.post("/.netlify/functions/server/deletePaintsPayment", deletePaintsPaymentData);

app.get("/.netlify/functions/server/getAreas", getAllAreas);
app.post("/.netlify/functions/server/addArea", sendAllAreas);
app.post("/.netlify/functions/server/deleteArea", deleteAreasData);

// paints area routes
app.get("/.netlify/functions/server/getPaintsAreas", getPaintsAllAreas);
app.post("/.netlify/functions/server/addPaintsArea", sendPaintsAllAreas);
app.post("/.netlify/functions/server/deletePaintsArea", deletePaintsAreasData);

app.post("/.netlify/functions/server/sendCompany", sendCompanyData);
app.post("/.netlify/functions/server/deleteCompany", deleteCompanyData);
app.get("/.netlify/functions/server/getCompany", getCompanyData);

// paints company routes
app.post("/.netlify/functions/server/sendPaintsCompany", sendPaintsCompanyData);
app.post("/.netlify/functions/server/deletePaintsCompany", deletePaintsCompanyData);
app.get("/.netlify/functions/server/getPaintsCompany", getPaintsCompanyData);

app.get("/.netlify/functions/server/getDesign", getDesignData);
app.post("/.netlify/functions/server/sendDesign", sendDesignData);
app.post("/.netlify/functions/server/deleteDesign", deleteDesignData);

// paints design routes
app.get("/.netlify/functions/server/getPaintsDesign", getPaintsDesignData);
app.post("/.netlify/functions/server/sendPaintsDesign", sendPaintsDesignData);
app.post("/.netlify/functions/server/deletePaintsDesign", deletePaintsDesignData);

app.get("/.netlify/functions/server/getInquiry", fetchInquiryData);
app.post("/.netlify/functions/server/sendInquiry", sendInquiryData);
app.post("/.netlify/functions/server/updateInquiry", updateInquiry);
app.post("/.netlify/functions/server/deleteInquiry", deleteInquiry);

// paints inquiry
app.get("/.netlify/functions/server/getPaintsInquiry", fetchPaintsInquiryData);
app.post("/.netlify/functions/server/sendPaintsInquiry", sendPaintsInquiryData);
app.post("/.netlify/functions/server/updatePaintsInquiry", updatePaintsInquiry);
app.post("/.netlify/functions/server/deletePaintsInquiry", deletePaintsInquiry);

app.get("/.netlify/functions/server/getBankData", getBankDetails);
app.post("/.netlify/functions/server/sendBankData", sendBankData);
app.post("/.netlify/functions/server/updateBankData", updateBankData);
app.post("/.netlify/functions/server/deleteBankData", deleteBankData);

// paints bank data
app.get("/.netlify/functions/server/getPaintsBankData", getPaintsBankDetails);
app.post("/.netlify/functions/server/sendPaintsBankData", sendPaintsInquiryData);
app.post("/.netlify/functions/server/updatePaintsBankData", updatePaintsInquiry);
app.post("/.netlify/functions/server/deletePaintsBankData", deletePaintsInquiry);

app.get("/.netlify/functions/server/getTermsData", getTermsDetails);
app.post("/.netlify/functions/server/sendTermsData", sendTermsData);
app.post("/.netlify/functions/server/deleteTermsData", deleteTermsData);

// paints terms details
app.get("/.netlify/functions/server/getPaintsTermsData", getPaintsBankDetails);
app.post("/.netlify/functions/server/sendPaintsTermsData", sendPaintsInquiryData);
app.post("/.netlify/functions/server/deletePaintsTermsData", deletePaintsInquiry);

module.exports.handler = serverless(app); 