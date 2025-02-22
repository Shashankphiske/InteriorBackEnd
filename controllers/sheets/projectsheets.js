const { google } = require("googleapis");
require("dotenv").config()

const sheetId = process.env.SHEET_ID;
const scopes = ["https://www.googleapis.com/auth/spreadsheets"]; // defines permission, here access to google sheets
const credentials = require("../../credentials.json");
const { getCustomerSerial, getCustomerData, CustomerData } = require("./customersheets");
const { InteriorData } = require("./interiorsheets");
const { SalesAssociateData } = require("./salesAssociatesheets");
const { AllAreaData } = require("./Area Sheets/areasheets");

const auth = new google.auth.JWT( // json web token for authentication
    credentials.client_email,
    null,
    credentials.private_key,
    scopes
);
const sheets = google.sheets({ version : "v4", auth }); // instance of sheets api

const customerSheetId=process.env.customerSheetId;
const interiorSheetId=process.env.interiorSheetId;
const salesAssociateSheetId=process.env.salesAssociateSheetId;
const allareaspreadsheetid=process.env.allareaspreadsheetid;

const sendProjectData = async (req, res) => {
    const { projectName, customerLink , projectReference, address, status, amount, received, due, createdBy, interiorPersonLink, salesAssociateLink, allAreaLink, quotationLink } = req.body;

    if(!projectName || !customerLink || !projectReference || !address || !status || !received || !due || !createdBy || !interiorPersonLink || !salesAssociateLink || !allAreaLink || !quotationLink){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        })
    }

    const date = new Date().toISOString().replace("T", " ").slice(0, 19);

    try{
        await sheets.spreadsheets.values.append({
            spreadsheetId : sheetId,
            range : "AllProjects!A:N",
            valueInputOption : "RAW",
            insertDataOption : "INSERT_ROWS",
            requestBody : {
                values : [[projectName, customerLink, projectReference, address, status, amount, received, due, createdBy, interiorPersonLink, salesAssociateLink, allAreaLink, quotationLink, date]],
            }
        });
    
        return res.status(200).json({
            success : true,
            message : "Data send successfully",
        })
    }
    catch(error){
        console.log("Error in inserting project values :",error);
        return res.status(500).json({
            success : false,
            message : "Error in inserting project data in sheets",
        })
    }
}

const addValues = async (rows, customerRows, interiorRows, SalesAssociateRows, allAreaRows) => {
    rows.forEach(row => {
        customerRows.forEach(customer => {
            if(customer[1] == row[1]){
                row[1] = customer;
                return;
            }
        });
        interiorRows.forEach(interior => {
            if(row[9] == interior[0]){
                row[9] = interior;
                return;
            }
        });
        SalesAssociateRows.forEach(associate => {
            if(row[10] == associate[0]){
                row[10] = associate;
                return;
            }
        });
        allAreaRows.forEach(areaRow => {
            if(row[11] == areaRow[0]){
                row[11] = areaRow;
            }
        });
    });

    return rows;
}

const getProjectData = async (req, res) => {
    try{
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId : sheetId,
            range : "AllProjects!A:N",
        });

        const rows = response.data.values;

        if(!rows || rows.length == 0){
            console.log("no data found");
            return res.status(400).json({
                success : false,
                message : "No project data available",
            });
        }

        const customerRows = await CustomerData();
        const InteriorRows = await InteriorData();
        const SalesAssociateRows = await SalesAssociateData();
        const AllAreaRows = await AllAreaData();
        const finalRows = await addValues(rows, customerRows, InteriorRows, SalesAssociateRows, AllAreaRows);

        return res.status(200).json({
            success : true,
            message : "Data sent",
            body : finalRows,
        })
    }
    catch(error){
        console.log("Error in retreiving project data from sheets :", error);
        return res.status(500).json({
            success : false,
            message : "Error in getting data from sheets",
        })
    }
}

const updateProjectValues = async (req, res) => {
    const { projectName, customerLink, projectReference, address, status, amount, received, due, createdBy, interiorPersonLink, salesAssociateLink, allAreaLink, quotationLink } = req.body;

    if(!projectName){
        return res.status(400).json({
            success : false,
            message : "Project name needed to update values",
        });
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : "AllProjects!A:N",
    });

    const rows = response.data.values;

    if(rows.length == 0){
        return res.status(400).json({
            success : false,
            message : "no project data availabe",
        })
    }

    let row = -1;
    let rowIndex = -1;
    for(let i = 0; i < rows.length ; i++){
        if(rows[i][0] === projectName){
            row = rows[i];
            rowIndex = i + 1;
            break;
        }
    }

    if(!row || rowIndex == -1){
        console.log("Row doesnt exist");
        return res.status(400).json({
            success : false,
            message : "Specified project index doesnt exist"
        });
    }

    const updatedrow = [
        projectName ?? row[0],
        customerLink ?? row[1],
        projectReference ?? row[2],
        address ?? row[3],
        status ?? row[4],
        amount ?? row[5],
        received ?? row[6],
        due ?? row[7],
        createdBy ?? row[8],
        interiorPersonLink ?? row[9],
        salesAssociateLink ?? row[10],
        allAreaLink ?? row[11],
        quotationLink ?? row[12],
        row[13]
    ]

    await sheets.spreadsheets.values.update({
        spreadsheetId : sheetId,
        range : `AllProjects!A${rowIndex}:N${rowIndex}`,
        valueInputOption : "RAW",
        resource : { values : [updatedrow]},
    });

    return res.status(200).json({
        success : true,
        message : "Project values updated successfully",
    });
}

const deleteProjectData = async (req, res) => {
    const { projectName } = req.body;

    if(!projectName){
        return res.status(400).json({
            success : false,
            message : "Project name required",
        });
    }

    let response = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId : sheetId,
        range : "AllProjects!A:N",
    });

    const rows = response.data.values;

    if(rows.length == 0){
        return res.status(400).json({
            success : false,
            message : "No project data found"
        })
    }

    let rowIndex = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == projectName){
            rowIndex = i;
            break;
        }
    }

    response = await sheets.spreadsheets.batchUpdate({
        auth,
        spreadsheetId : sheetId,
        resource : {
            requests : [
                {
                    deleteDimension : {
                        range : {
                            sheetId : 0,
                            dimension : "ROWS",
                            startIndex : rowIndex,
                            endIndex : rowIndex + 1
                        }
                    }
                }
            ]
        }
    });

    return res.status(200).json({
        success : true,
        message : "Project deleted successfully",
    });
}
module.exports = { sendProjectData, getProjectData, updateProjectValues, deleteProjectData };