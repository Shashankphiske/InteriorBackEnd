const { sheets } = require("../../../db/googleuser");
require("dotenv").config();

const range = "Tailors!A:D";

const sheetId = process.env.tailorsheetid;

const addTailor = async (req, res) => {
    const { tailorName, phoneNumber, email, address } = req.body;

    if(!tailorName || !phoneNumber || !email || !address){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range : range,
        insertDataOption : "INSERT_ROWS",
        valueInputOption : "RAW",
        requestBody : {
            values : [[ tailorName, phoneNumber, email, address ]],
        }
    });

    return res.status(200).json({
        success : true,
        message : "New tailor added",
    });
}

const deleteTailor = async (req, res) => {
    const { tailorName } = req.body;

    if(!tailorName){
        return res.status(400).json({
            success : false,
            message : "Tailor name is required",
        });
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    const rows = response.data.values;
    if(rows == undefined){
        return res.status(400).json({
            success : false,
            message : "No data available in Tailors database",
        });
    }

    let index = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == tailorName){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No tailor with the name : ${tailorName} found`,
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
        message : "Tailor deleted",
    });
}

const getAllTailors = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    return res.status(200).json({
        success : true,
        message : "Data fetched from tailors database",
        body : response.data.values,
    });
}

const updateTailor = async (req, res) => {
    const { tailorName, phoneNumber, email, address } = req.body;

    if(!tailorName){
        return res.status(400).json({
            success : false,
            message : "Tailor name is required",
        });
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    const rows = response.data.values;

    if(rows == undefined){
        return res.status(400).json({
            success : false,
            message : "No data found in the tailors database",
        });
    }

    let index = -1;
    let row = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == tailorName){
            index = i + 1;
            row = rows[i];
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No tailor with the name : ${tailorName} found`,
        });
    }

    const newrow = [
        tailorName,
        phoneNumber ?? row[1],
        email ?? row[2],
        address ?? row[3],
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId : sheetId,
        range : `Tailors!A${index}:D${index}`,
        valueInputOption : "RAW",
        resource : {
            values : [newrow],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Tailor data updated",
    });
}

module.exports = { addTailor, deleteTailor, getAllTailors, updateTailor };