const { google } = require("googleapis");
require("dotenv").config();

const sheetId = process.env.customerSheetId;
const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const credentials = require("../../credentials.json");

const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scopes
);

const sheets = google.sheets({version : "v4", auth});

const range = "CustomerData!A:D";

const getCustomerSerial = async () => {
    const response = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId : sheetId,
        range,
    });

    const rows = response.data.values;

    if(!rows || rows.length == 0){
        return 0;
    }else{
        return rows.length;
    }
}

const sendCustomerData = async (req, res) => {
    const { name, phonenumber, address } = req.body;

    if(!name || !phonenumber || !address){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    let srno = await getCustomerSerial();
    srno++;

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range,
        valueInputOption : "RAW",
        insertDataOption : "INSERT_ROWS",
        requestBody : {
            values : [[srno, name, phonenumber, address]],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Customer data inserted successfully",
    })
}

const deleteCustomerData = async (req, res) => {
    const { name } = req.body;

    if(!name){
        return res.status(400).json({
            success : false,
            message : "Email required",
        });
    }

    let response = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId : sheetId,
        range
    });

    const rows = response.data.values;
    let rowIndex = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][1] == name){
            rowIndex = i;
            break;
        }
    }

    if(rowIndex == -1){
        return res.status(400).json({
            success : false,
            message : "User not found",
        })
    }

    response = await sheets.spreadsheets.batchUpdate({
        auth,
        spreadsheetId : sheetId,
        resource : {
            requests : [
                {
                    deleteDimension : {
                        range : {
                            sheetId : 0,
                            dimension : "ROWS",
                            startIndex : rowIndex,
                            endIndex : rowIndex + 1,
                        }
                    }
                }
            ]
        }
    });

    return res.status(200).json({
        success : true,
        message : "User deleted successfully",
    });
}

const getCustomerData = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId : sheetId,
        range
    });

    if(!response.data.values){
        return res.status(400).json({
            success : false,
            message : "No user data found",
        });
    }

    return res.status(200).json({
        success : true,
        message : "Customer data fetched successfully",
        body : response.data.values,
    })
}

const CustomerData = async () => {
    const response = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId : sheetId,
        range
    });

    if(!response.data.values){
        return null;
    }

    return response.data.values;
}

module.exports = { sendCustomerData, deleteCustomerData, getCustomerData, getCustomerSerial, CustomerData };