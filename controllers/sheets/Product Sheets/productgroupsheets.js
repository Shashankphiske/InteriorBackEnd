const { google } = require("googleapis");
require("dotenv").config();

const credentials = require("../../../credentials.json");
const scopes = ["https://www/googleapis.com/auth/spreadsheets"];
const auth  = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scopes,
);

const sheetId = process.env.productsheetid;

const sheets = google.sheets({ version : "v4", auth });

const range = "ProductGroup!A:E";

const addProductGroup = async (req, res) => {
    const { groupName, mainProducts, addonProducts, color, needsTailoring } = req.body;

    if(!groupName || !mainProducts || !addonProducts || !color || !needsTailoring){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range : range,
        valueInputOption : "RAW",
        insertDataOption : "INSERT_ROWS",
        requestBody : {
            values : [[ groupName, mainProducts, addonProducts, color, needsTailoring ]],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Product group added",
    });
}

module.exports = { addProductGroup };