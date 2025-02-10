const { google } = require("googleapis");
require("dotenv").config();

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const credentials = require("../../credentials.json");
const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scopes,
);
const sheetId = process.env.salesAssociateSheetId;
const range = "Sheet1!A:D";

const sheets = google.sheets({version : "v4", auth});

const sendSalesAssociateData = async (req, res) => {
    const { name, email, phonenumber, address } = req.body;
    
    if(!name || !email || !phonenumber || !address){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range,
        valueInputOption : "RAW",
        insertDataOption : "INSERT_ROWS",
        requestBody : {
            values : [[name, email, phonenumber, address]]
        }
    });

    res.status(200).json({
        success : true,
        message : "Associate data added successfully",
    });
}

const getSalesAssociateData = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range,
    });

    return res.status(200).json({
        success : true,
        message : "Associate data fetched successfully",
        body : response.data.values,
    });

}

const deleteSalesAssociateData = async (req, res) => {
    const {email} = req.body;

    if(!email){
        res.status(400).json({
            success : false,
            message : "Email is required",
        });
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range,
    });

    const rows = response.data.values;
    if(rows.length == 0){
        return res.status(400).json({
            success : false,
            message : "No associate data found",
        });
    }

    let index = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][1] === email){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : "No associate related to email found",
        });
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId : sheetId,
        resource : {
            requests : [
                {
                    deleteDimension : {
                        range : {
                            sheetId : 0,
                            dimension : "ROWS",
                            startIndex : index,
                            endIndex : index + 1,
                        }
                    }
                }
            ]
        }
    });

    return res.status(200).json({
        success : true,
        message : "Associate deleted successfully",
    });
}

module.exports = { sendSalesAssociateData, getSalesAssociateData, deleteSalesAssociateData };