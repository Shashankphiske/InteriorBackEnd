const { sheets } = require("../../../db/googleuser");
require("dotenv").config();

const sheetId = process.env.productsheetid;

const range = "IndividualProducts!A:H";

const addNewProduct = async (req, res) => {
    const { productName, description, groupTypes, sellingUnit, mrp, taxRate, date, needsTailoring } = req.body;

    if(!productName || !groupTypes || !sellingUnit || !mrp || !date){
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

const dayjs = require("dayjs");

const updateProductsToSheet = async (req, res) => {
try {
const { products } = req.body;
console.log("Received products:", products);

if (!Array.isArray(products)) {
  return res.status(400).json({ error: "Invalid request: 'products' must be an array." });
}

// Fetch current sheet data
const response = await sheets.spreadsheets.values.get({
  spreadsheetId: sheetId,
  range: "IndividualProducts!A:H",
});

const rows = response.data.values || [];

// Map existing product names to their row numbers
const existingMap = {};
rows.forEach((row, index) => {
  const productName = row[0]?.trim();
  if (productName) {
    existingMap[productName] = index + 1; // Sheet rows start at 1; +1 for header
  }
});

const updates = [];
const inserts = [];

for (const product of products) {
  const name = product.productName?.trim();
  const rrp = product.rrp;
  const gst = product.gst;

  if (!name || !rrp || !gst) {
    console.warn("Skipping invalid product:", product);
    continue;
  }

  const currentDate = dayjs().format("DD-MM-YYYY");
  const defaultValues = [
    name,
    "NA",
    "Area Based",
    "Sq.feet",
    rrp,
    gst,
    currentDate,
    "false"
  ];

  if (existingMap[name]) {
    const rowIndex = existingMap[name];
    const oldRow = rows[rowIndex - 2];
    const oldDate = oldRow[6] || currentDate;

    updates.push({
      range: `IndividualProducts!A${rowIndex}:H${rowIndex}`,
      values: [[
        name,
        "NA",
        "Area Based",
        "Sq.feet",
        rrp,
        gst,
        oldDate,
        "false"
      ]]
    });
  } else {
    inserts.push(defaultValues);
  }
}

console.log(`Updating ${updates.length} rows...`);
console.log(`Appending ${inserts.length} new rows...`);

// Perform batch update for existing rows
if (updates.length > 0) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED", // allows formulas, parsed numbers, etc.
      data: updates,
    },
  });
}

// Append new rows
if (inserts.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "IndividualProducts!A:H",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: inserts,
    },
  });
}

return res.status(200).json({ message: "Sheet updated successfully." });
} catch (err) {
console.error("Error updating sheet:", err);
return res.status(500).json({ error: "Failed to update sheet." });
}
};

const addImportedProducts = async (req, res) => {
    const rows = req.body.items;

    console.log(rows);

    if(rows.length == 0){
        return res.status(400).json({
            success : false,
            message : "no data sent",
        });
    }

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range : range,
        valueInputOption : "RAW",
        requestBody : {
            values : rows
        }
    });

    return res.status(200).json({
        success : true,
        message : "Products Imported",
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

module.exports = { addNewProduct, deleteSingleProduct, updateSingleProduct, getSingleProducts, addImportedProducts, updateProductsToSheet };