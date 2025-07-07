require("dotenv").config();
const { sheets } = require("../../../db/googleuser");

const range = "Brands!A:B";

const sheetId = process.env.brandsheetid;

const addBrand = async (req, res) => {
    const { brandName, description } = req.body;

    if(!brandName){
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
            values : [[brandName, description]],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Brand added",
    });
}

const deleteBrand = async (req, res) => {
    const { brandName } = req.body;

    if(!brandName){
        return res.status(400).json({
            success : false,
            message : "Brand name is required",
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
            message : "No data available in brands database",
        });
    }

    let index = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == brandName){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No brand with the name : ${brandName} found`,
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
        message : `${brandName} deleted`,
    });
}

const getBrands = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range,
    });

    res.status(200).json({
        success : true,
        message : "Data fetched from Brands database",
        body : response.data.values,
    });
}

const updateBrand = async (req, res) => {
    const { brandName, description } = req.body;

    if(!brandName){
        return res.status(400).json({
            success : false,
            message : "Brand name is required",
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
            message : "no data found in brand database",
        });
    }

    let row = -1;
    let index = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == brandName){
            index = i + 1;
            row = rows[i];
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No brand with the name ${brandName} found`,
        });
    }

    const newrow = [
        brandName,
        description ?? row[1],
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId : sheetId,
        range : `Brands!A${index}:B${index}`,
        valueInputOption : "RAW",
        resource : {
            values : [newrow],
        }
    });

    return res.status(200).json({
        success : true,
        message : `Update ${brandName}`,
    });
}

module.exports = { addBrand, deleteBrand, getBrands, updateBrand }