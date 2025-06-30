const { sheets } = require("../../db/googleuser")
require("dotenv").config;

const sheetId = "1cCfIBIP5qWXn-G76qjjX-2ZVd_uLVE1EJ31nNhvcfX8";
const range = "Sheet1!A:G";

const fetchPaintsInquiryData = async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return res.status(200).json({
            success : true,
            body : response.data.values
        })
    } catch (error) {
        console.error("Error fetching inquiry data:", error);
        return res.status(500).json({
            success : false,
            message : "Error"
        })
    }
};

const sendPaintsInquiryData = async (req, res) => {
    const { projectName, phonenumber, comment, inquiryDate, projectDate, status, customer } = req.body;

    if (![projectName].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[projectName, phonenumber, comment, inquiryDate, projectDate, status, customer]] },
        });

        return res.status(200).json({ success: true, message: "Data sent successfully" });
    } catch (error) {
        console.error("Error adding inquiry data:", error);
        return res.status(500).json({ success: false, message: "Failed to add data" });
    }
};

const updatePaintsInquiry = async (req, res) => {
    const { projectName, status } = req.body;

    if(!projectName){
        return res.status(400).json({
            success : false,
            message : "project name is required",
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
            message : "no data found in inquiry database",
        });
    }

    let row = -1;
    let index = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == projectName){
            index = i + 1;
            row = rows[i];
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No inquiry with the name ${projectName} found`,
        });
    }

    const newrow = [
        projectName,
        row[1],
        row[2],
        row[3],
        row[4],
        status ?? row[5],
        row[6]
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId : sheetId,
        range : `Sheet1!A${index}:G${index}`,
        valueInputOption : "RAW",
        resource : {
            values : [newrow],
        }
    });

    return res.status(200).json({
        success : true,
        message : `Updated ${projectName}`,
    });
}

const deletePaintsInquiry = async (req, res) => {
    const { projectName } = req.body;

    if(!projectName){
        return res.status(400).json({
            success : false,
            message : "Project name is required",
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
            message : "No data available in Inquiry database",
        });
    }

    let index = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == projectName){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No Inquiry with the name : ${projectName} found`,
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
        message : "Inquiry deleted",
    });
}

module.exports = { fetchPaintsInquiryData, sendPaintsInquiryData, updatePaintsInquiry, deletePaintsInquiry }