const { sheets } = require("../../../db/googleuser");
require("dotenv").config();

const range = "Catalogues!A:B";

const sheetId = process.env.cataloguesheetid;

const addCatalogue = async (req, res) => {
    const { catalogueName, description } = req.body;

    if(!catalogueName || !description){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range,
        insertDataOption : "INSERT_ROWS",
        valueInputOption : "RAW",
        requestBody : {
            values : [[catalogueName, description]],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Catalogue added",
    });
}

const deleteCatalogue = async (req, res) => {
    const { catalogueName } = req.body;

    if(!catalogueName){
        return res.status(400).json({
            success : false,
            message : "Catalogue name is required",
        });
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range,
    });

    const rows = response.data.values;

    if(rows == undefined){
        return res.status(400).json({
            success : false,
            message : "No data available in catalogues database",
        });
    }

    let index = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == catalogueName){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No catalogue with the name : ${catalogueName} found`,
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

    res.status(200).json({
        success : true,
        message : `${catalogueName} deleted`,
    });
}

const getCatalogues = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range,
    });

    res.status(200).json({
        success : true,
        message : "Data fetched from Catalogues database",
        body : response.data.values,
    });
}

const updateCatalogue = async (req, res) => {
    const { catalogueName, description } = req.body;

    if(!catalogueName){
        return res.status(400).json({
            success : false,
            message : "Catalogue name is required",
        });
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range,
    });

    const rows = response.data.values;

    if(rows == undefined){
        return res.status(400).json({
            success : false,
            message : "no data found in catalogue database",
        });
    }

    let row = -1;
    let index = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == catalogueName){
            index = i + 1;
            row = rows[i];
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No Catalogue with the name ${catalogueName} found`,
        });
    }

    const newrow = [
        catalogueName,
        description ?? row[1],
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId : sheetId,
        range : `Catalogues!A${index}:B${index}`,
        valueInputOption : "RAW",
        resource : {
            values : [newrow],
        }
    });

    return res.status(200).json({
        success : true,
        message : `Updated ${catalogueName}`,
    });
}

module.exports = { addCatalogue, deleteCatalogue, getCatalogues, updateCatalogue };