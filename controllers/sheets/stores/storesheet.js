const { sheets } = require("../../../db/googleuser");
require("dotenv").config();

const range = "Stores!A:D";
const sheetId = process.env.storesheetid;


const addStore = async (req, res) => {
    const { storeName, storeAddress, phonenumber, email } = req.body;

    if(!storeName || !storeAddress){
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
            values : [[ storeName, storeAddress, phonenumber, email ]],
        }
    });

    res.status(200).json({
        success : true,
        message : "New store added",
    });
}

const deleteStore = async (req, res) => {
    const { storeName } = req.body;

    if(!storeName){
        return res.status(400).json({
            success : false,
            message : "Store name is required",
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
            message : "No data available in the stores database",
        });
    }

    let index = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == storeName){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No store found with the name : ${storeName}`,
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
        message : `${storeName} removed successfully`,
    });
}

const getAllStores = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    return res.status(200).json({
        success : true,
        message : "Data fetched from stores database",
        body : response.data.values,
    });
}

const updateStores = async (req, res) => {
    const { storeName, storeAddress, phonenumber, email } = req.body;

    if(!storeName){
        return res.status(400).json({
            success : false,
            message : "Store name is required",
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
            message : "No data in stores database",
        });
    }

    let index = -1;
    let row = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == storeName){
            index = i + 1;
            row = rows[i];
            break;
        }
    }

    const newrow = [
        storeName,
        storeAddress ?? row[1],
        phonenumber ?? row[2],
        email ?? row[3]
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId : sheetId,
        range : `Stores!A${index}:D${index}`,
        valueInputOption : "RAW",
        resource : {
            values : [newrow],
        }
    });

    return res.status(200).json({
        success : true,
        message : `Updates store : ${storeName}`,
    });

}

module.exports = { addStore, deleteStore, updateStores, getAllStores };