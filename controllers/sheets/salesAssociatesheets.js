const { sheets } = require("../../db/googleuser");
require("dotenv").config();

const sheetId = process.env.salesAssociateSheetId;
const range = "SalesAssociateData!A:D";

// Utility function to fetch all sales associate data
const fetchSalesAssociateData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching Sales Associate data:", error);
        return [];
    }
};

// Add a new sales associate
const sendSalesAssociateData = async (req, res) => {
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

        return res.status(200).json({ success: true, message: "Associate data added successfully" });
    } catch (error) {
        console.error("Error adding sales associate data:", error);
        return res.status(500).json({ success: false, message: "Failed to add associate data" });
    }
};

// Retrieve all sales associates
const getSalesAssociateData = async (req, res) => {
    try {
        const rows = await fetchSalesAssociateData();
        if (!rows.length) {
            return res.status(400).json({ success: false, message: "No associate data found" });
        }
        return res.status(200).json({ success: true, message: "Data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching sales associate data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

// Delete a sales associate by email
const deleteSalesAssociateData = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const rows = await fetchSalesAssociateData();
        const index = rows.findIndex(row => row[1] === email); // Find index based on email

        if (index === -1) {
            return res.status(400).json({ success: false, message: "No associate found with this email" });
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

        return res.status(200).json({ success: true, message: "Associate deleted successfully" });
    } catch (error) {
        console.error("Error deleting sales associate:", error);
        return res.status(500).json({ success: false, message: "Failed to delete associate data" });
    }
};

// Export functions
module.exports = { sendSalesAssociateData, getSalesAssociateData, deleteSalesAssociateData, fetchSalesAssociateData };
