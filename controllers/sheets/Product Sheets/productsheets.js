const { sheets } = require("../../../db/googleuser");
require("dotenv").config();

const sheetId = process.env.productsheetid;

const range = "IndividualProducts!A:H";

const addNewProduct = async (req, res) => {
    const { productName, description, groupTypes, sellingUnit, mrp, taxRate, date, needsTailoring }=req.body;

    if(!productName || !groupTypes || !sellingUnit || !mrp || !taxRate || !date){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
            body : req.body
        });
    }

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range : range,
        valueInputOption : "RAW",
        insertDataOption : "INSERT_ROWS",
        requestBody : {
            values : [[productName, description, groupTypes, sellingUnit, mrp, taxRate, date, needsTailoring]],
        }
    });

    return res.status(200).json({
        success : true,
        message : "New product created",
    });
}

const deleteSingleProduct = async (req, res) => {
    const { productName } = req.body;
    if(!productName){
        return res.status(400).json({
            success : false,
            message : `No product available with the the name ${productName}`
        })
    }

    let index = -1;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    const rows = response.data.values;
    if(rows == undefined){
        return res.status(400).json({
            success : false,
            message : "No products available in the database",
        });
    }

    for(let i = 0; i < rows.length ;i++){
        if(rows[i][0] == productName){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No product with the name ${productName} found`,
        });
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId : sheetId,
        resource : {
            requests : [
                {
                    deleteDimension : {
                        range : {
                            sheetId : 1686689644,
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
        success : false,
        message : `${productName} deleted successfully`,
    });
}

const updateSingleProduct = async (req, res) => {
    const { productName, description, groupTypes, sellingUnit, mrp, taxRate, date, needsTailoring }=req.body;

    if(!productName){
        return res.status(400).json({
            success : false,
            message : "Product name is required",
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
            message : "No products available in the database",
        });
    }

    let row = -1
    let rowindex = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == productName){
            row = rows[i];
            rowindex = i + 1;
            break;
        }
    }

    if(row == -1 || rowindex == -1){
        return res.status(400).json({
            success : false,
            message : `No product with the name : ${productName} found`,
        });
    }

    const updatedrow = [
        productName,
        description ?? row[1],
        groupTypes ?? row[2],
        sellingUnit ?? row[3],
        mrp ?? row[4],
        taxRate ?? row[5],
        date ?? row[6],
        needsTailoring ?? row[7]
    ]

    await sheets.spreadsheets.values.update({
        spreadsheetId : sheetId,
        range : `IndividualProducts!A${rowindex}:H${rowindex}`,
        valueInputOption : "RAW",
        resource : { values : [updatedrow] }
    });

    return res.status(200).json({
        success : true,
        message :  `${productName} updated successfully`,
    });
}

const getSingleProducts = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    const rows = response.data.values;

    return res.status(200).json({
        success : true,
        message : "Single product data fetched",
        body : rows,
    });
}

module.exports = { addNewProduct, deleteSingleProduct, updateSingleProduct, getSingleProducts };