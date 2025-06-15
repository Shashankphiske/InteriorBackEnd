const { sheets } = require("../db/googleuser");
require("dotenv").config;

const sheetId = "1G98mY1kooSP4ouckUg0uye0IoAOw6e63Almt6wt55d0";
const range = "Sheet1!A:E";

const fetchInquiryData = async (req, res) => {
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

const sendInquiryData = async (req, res) => {
    const { projectName, comment, inquiryDate, projectDate, status } = req.body;

    if (![projectName].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[projectName, comment, inquiryDate, projectDate, status]] },
        });

        return res.status(200).json({ success: true, message: "Data sent successfully" });
    } catch (error) {
        console.error("Error adding inquiry data:", error);
        return res.status(500).json({ success: false, message: "Failed to add data" });
    }
};

module.exports = { fetchInquiryData, sendInquiryData }