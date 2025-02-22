const { google } = require("googleapis");
require("dotenv").config();

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const credentials = require("../../../credentials.json");
const sheetId = process.env.areamapsheetid;
const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scopes,
);

const range = "Sheet1!A:B";

const sheets = google.sheets({version : "v4", auth});

const addAreaMap = async (areaName, newSheetId) => {
    const response = await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range : range,
        valueInputOption : "RAW",
        insertDataOption : "INSERT_ROWS",
        requestBody : {
            values : [[areaName, newSheetId]],
        }
    });
}

const deleteAreaMap = async (areaName) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    const rows = response.data.values;

    if(rows.length == 0){
        return false;
    }

    let index = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == areaName){
            index = i;
            break;
        }
    }
    if(index == -1){
        return false;
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

    return true;
}

const getAreaMap = async (areaMap) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    const rows = response.data.values;

    if(rows == 0){
        return -1;
    }

    let newSheetId = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] === areaMap){
            newSheetId = rows[i][1];
            return newSheetId;
        }
    }

    if(newSheetId == -1){
        return -1;
    }
}

const getAllAreaMap = async () => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    const rows = response.data.values;

    return rows;
}

module.exports = { addAreaMap, deleteAreaMap, getAreaMap, getAllAreaMap };