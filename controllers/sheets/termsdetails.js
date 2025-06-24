const { sheets } = require("../../db/googleuser");
require("dotenv").config();

const sheetId = "1zDucvXy01-Hm6B2712tOJO1q2VJZPEc5hoAdECBAuOk";
const range = "Sheet1!A:B";

// Utility function to fetch all interior data
const fetchTermsDetailsData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching bank data:", error);
        return [];
    }
};

// Add a new interior data entry
const sendTermsData = async (req, res) => {
    const { terms, date } = req.body;

    if (![terms, date].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[terms, date]] },
        });

        return res.status(200).json({ success: true, message: "Data sent successfully" });
    } catch (error) {
        console.error("Error adding terms data:", error);
        return res.status(500).json({ success: false, message: "Failed to add data" });
    }
};

// Retrieve all interior data
const getTermsDetails = async (req, res) => {
    try {
        const rows = await fetchTermsDetailsData();
        if (!rows.length) {
            return res.status(400).json({ success: false, message: "No terms data found" });
        }
        return res.status(200).json({ success: true, message: "Data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching terms data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

// Delete an interior data entry by email
const deleteTermsData = async (req, res) => {
    const { terms } = req.body;

    if (!terms) {
        return res.status(400).json({ success: false, message: "Name is required for deletion" });
    }

    try {
        const rows = await fetchTermsDetailsData();
        const index = rows.findIndex(row => row[0] === terms); // Find index based on email

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

        return res.status(200).json({ success: true, message: "terms data deleted successfully" });
    } catch (error) {
        console.error("Error deleting terms data:", error);
        return res.status(500).json({ success: false, message: "Failed to delete data" });
    }
};

// Export functions
module.exports = { sendTermsData, deleteTermsData, getTermsDetails };
