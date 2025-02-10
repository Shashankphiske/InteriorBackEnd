const { google } = require("googleapis");
require("dotenv").config();

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const sheetId = process.env.interiorSheetId;
const credentials = require("../../credentials.json");

const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scopes
);

const sheets = google.sheets({ version : "v4", auth });

const range = "Sheet1!A:D";

const sendInteriorData = async (req, res) => {
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
            values : [[name, email, phonenumber, address]],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Data sent successfully",
    });
}

const getInteriorData = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range,
    });

    const rows = response.data.values;

    res.status(200).json({
        success : true,
        message : "Data fetched successfully",
        body : rows,
    })
}

const deleteInteriorData = async (req, res) => {
    const { email } = req.body;
    if(!email){
        return res.status(400).json({
            success : false,
            message : "Email is required for deletion",
        });
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range,
    });
    
    let index = -1;

    const rows = response.data.values;

    if(rows.length == 0){
        return res.status(400).json({
            success : false,
            message : "No interior data found",
        });
    }

    for(let i = 0; i < rows.length; i++){
        if(rows[i][1] === email){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : "No row related to email found",
        });
    }

    await sheets.spreadsheets.batchUpdate({
        auth,
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
        sucess : true,
        message : "Interior data deleted successfully",
    })
}

module.exports = { sendInteriorData, getInteriorData, deleteInteriorData }