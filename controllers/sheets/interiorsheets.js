const { google } = require("googleapis");
require("dotenv").config();

const credentials = require("../../credentials.json");

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT(credentials.client_email, null, credentials.private_key, scopes);
const sheets = google.sheets({ version: "v4", auth });

const sheetId = process.env.interiorSheetId;
const range = "InteriorData!A:D";

// Utility function to fetch all interior data
const fetchInteriorData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching interior data:", error);
        return [];
    }
};

// Add a new interior data entry
const sendInteriorData = async (req, res) => {
    const { name, email, phonenumber, address } = req.body;

    if (![name, email, phonenumber, address].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[name, email, phonenumber, address]] },
        });

        return res.status(200).json({ success: true, message: "Data sent successfully" });
    } catch (error) {
        console.error("Error adding interior data:", error);
        return res.status(500).json({ success: false, message: "Failed to add data" });
    }
};

// Retrieve all interior data
const getInteriorData = async (req, res) => {
    try {
        const rows = await fetchInteriorData();
        if (!rows.length) {
            return res.status(400).json({ success: false, message: "No interior data found" });
        }
        return res.status(200).json({ success: true, message: "Data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching interior data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

// Delete an interior data entry by email
const deleteInteriorData = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required for deletion" });
    }

    try {
        const rows = await fetchInteriorData();
        const index = rows.findIndex(row => row[1] === email); // Find index based on email

        if (index === -1) {
            return res.status(400).json({ success: false, message: "No row related to email found" });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            resource: {
                requests: [{
                    deleteDimension: {
                        range: { sheetId: 0, dimension: "ROWS", startIndex: index, endIndex: index + 1 }
                    }
                }]
            }
        });

        return res.status(200).json({ success: true, message: "Interior data deleted successfully" });
    } catch (error) {
        console.error("Error deleting interior data:", error);
        return res.status(500).json({ success: false, message: "Failed to delete data" });
    }
};

// Export functions
module.exports = { sendInteriorData, getInteriorData, deleteInteriorData, fetchInteriorData };
