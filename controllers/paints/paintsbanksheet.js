const { sheets } = require("../../db/googleuser")
require("dotenv").config();

const sheetId = "1xoJrgyJXKaP7tcsDZvmhvxRdJGsyl3AfDit5UHgAj-M";
const range = "Sheet1!A:D";

// Utility function to fetch all interior data
const fetchPaintsBankDetailsData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching bank data:", error);
        return [];
    }
};

const updatePaintsBankData = async (req, res) => {
    const { customerName, accountNumber, ifscCode } = req.body;

    if (!customerName) {
        return res.status(400).json({ success: false, message: "Title is required" });
    }

    try {
        const rows = await fetchPaintsBankDetailsData();
        const index = rows.findIndex(row => row[0] === customerName);

        if (index === -1) {
            return res.status(404).json({ success: false, message: `No bank data found with name: ${customerName}` });
        }

        // Keep existing values if new ones are not provided
        const updatedRow = rows[index].map((value, i) => [
            customerName, accountNumber, ifscCode
        ][i] ?? value);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Sheet1!A${index + 1}:D${index + 1}`,
            valueInputOption: "RAW",
            resource: { values: [updatedRow] },
        });

        return res.status(200).json({ success: true, message: "bank data updated successfully" });
    } catch (error) {
        console.error("Error updating bank data:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// Add a new interior data entry
const sendPaintsBankData = async (req, res) => {
    const { customerName, accountNumber, ifscCode, date } = req.body;

    if (![customerName, accountNumber, ifscCode, date].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[customerName, accountNumber, ifscCode, date]] },
        });

        return res.status(200).json({ success: true, message: "Data sent successfully" });
    } catch (error) {
        console.error("Error adding Bank data:", error);
        return res.status(500).json({ success: false, message: "Failed to add data" });
    }
};

// Retrieve all interior data
const getPaintsBankDetails = async (req, res) => {
    try {
        const rows = await fetchPaintsBankDetailsData();
        if (!rows.length) {
            return res.status(200).json({ success: false, message: "No bank data found" });
        }
        return res.status(200).json({ success: true, message: "Data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching interior data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

// Delete an interior data entry by email
const deletePaintsBankData = async (req, res) => {
    const { customerName } = req.body;

    if (!customerName) {
        return res.status(400).json({ success: false, message: "Name is required for deletion" });
    }

    try {
        const rows = await fetchPaintsBankDetailsData();
        const index = rows.findIndex(row => row[0] === customerName); // Find index based on email

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

        return res.status(200).json({ success: true, message: "bank data deleted successfully" });
    } catch (error) {
        console.error("Error deleting bank data:", error);
        return res.status(500).json({ success: false, message: "Failed to delete data" });
    }
};

// Export functions
module.exports = { sendPaintsBankData, updatePaintsBankData, deletePaintsBankData, getPaintsBankDetails };
