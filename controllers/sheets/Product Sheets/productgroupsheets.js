const { sheets } = require("../../../db/googleuser");
require("dotenv").config();

const sheetId = process.env.productsheetid;

const range = "ProductGroup!A:D";

const addProductGroup = async (req, res) => {
    const { groupName, mainProducts, addonProducts, status } = req.body;



    if(!groupName || !mainProducts || !addonProducts){
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
            values : [[ groupName, mainProducts, addonProducts, status ]],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Product group added",
    });
}

const deleteProductGroup = async (req, res) => {
    const { groupName } = req.body;

    if(!groupName){
        return res.status(400).json({
            success : false,
            message : "Group name is required",
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
            message : "No data in the backend of productgroup"
        });
    }

    let index = -1;

    for(let i = 0 ; i < rows.length; i++){
        if(rows[i][0] == groupName){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No product group with the name ${groupName} found`,
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
        message : "Data deleted from product group",
    });
}

const updateProductGroup = async (req, res) => {
    const { groupName, mainProducts, addonProducts, status } = req.body;

    if(!groupName){
        return res.status(400).json({
            success : false,
            message : "Group name required",
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
            message : "No data available in the database",
        });
    }

    let index = -1;
    let row = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == groupName){
            index = i + 1;
            row = rows[i];
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No product group with the name ${groupName} found`,
        })
    }

    const newrow = [
        groupName,
        mainProducts ?? row[1],
        addonProducts ?? row[2],
        status ?? row[3]
    ];

    const newrange = `ProductGroup!A${index}:D${index}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId : sheetId,
        range : newrange,
        valueInputOption : "RAW",
        resource : {
            values : [newrow],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Product group updated",
    });
}

const getAllProductGroups = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    return res.status(200).json({
        success : true,
        message : "Data fetched",
        body : response.data.values,
    });
}

module.exports = { addProductGroup, deleteProductGroup, updateProductGroup, getAllProductGroups };