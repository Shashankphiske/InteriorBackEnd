const { google } = require("googleapis");
require("dotenv").config();
const fs = require("fs");
const { addAreaMap, deleteAreaMap, getAreaMap } = require("./areamap");

const credentials = require("../../../credentials.json");

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const sheetId = process.env.allareaspreadsheetid;
let range = "{areaName}!A:F";

const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scopes,
);

const sheets = google.sheets({version : "v4", auth});

const addNewSheet = async (areaName) => {
    const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId : sheetId,
        resource : {
            requests : [{ addSheet : { properties : { title : areaName } } }],
        }
    });

    const newSheetId = response.data.replies[0].addSheet.properties.sheetId;
    return newSheetId;
}

const addDataToArea = async (req, res) => {
    const { areaName, projectName, productGroup, company, catalogue, designNumber, imageReference, actions } = req.body;

    if(!areaName || !projectName || !productGroup || !company || !catalogue || !designNumber || !imageReference || !actions){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    let newSheetId = await getAreaMap(areaName);

    if(newSheetId == -1){
        newSheetId = await addNewSheet(areaName);
        await addAreaMap(areaName, newSheetId)
    }

    const newrange = range.replace("{areaName}", areaName);

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range : newrange,
        valueInputOption : "RAW",
        insertDataOption : "INSERT_ROWS",
        requestBody : {
            values : [[projectName, productGroup, company, designNumber, imageReference, actions]]
        }
    })

    return res.status(200).json({
        success : true,
        message : `Data added in ${areaName}`,
    });
}

const removeDataFromArea = async (req, res) => {
    const { areaName, projectName } = req.body;

    if(!areaName || !projectName){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    let newsheetId = await getAreaMap(areaName);

    if(newsheetId == -1){
        return res.status(400).json({
            success : false,
            message : "Area doesnt exist",
        });
    }

    const newrange = range.replace("{areaName}", areaName);

    try{
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId : sheetId,
            range : newrange,
        });

        const rows = response.data.values;
        let index = -1;

        if(rows === undefined){
            return res.status(400).json({
                success : false,
                message : `No data available in ${areaName}`,
            })
        }

        for(let i = 0; i < rows.length; i++){
            if(rows[i][0] == projectName){
                index = i;
                break;
            }
        }

        if(index == -1){
            return res.status(400).json({
                success : false,
                message : "No project found",
            });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId : sheetId,
            resource : {
                requests : [
                    {
                        deleteDimension : {
                            range : {
                                sheetId : newsheetId,
                                dimension : "ROWS",
                                startIndex : index,
                                endIndex : index+1,
                            }
                        }
                    }
                ]
            }
        });

        return res.status(200).json({
            success : true,
            message : "Project from area deleted successfully",
        })
    }
    catch(error){
        console.log("Error in deleting area sheet data :", error);
        return res.status(400).json({
            success : false,
            message : "Project name does'nt exist",
        })
    }
}

module.exports = { addDataToArea, removeDataFromArea };