const { sheets } = require("../../db/googleuser");
require("dotenv").config();

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

const updateInteriorData = async (req, res) => {
    const { name, email, phonenumber, address } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Title is required" });
    }

    try {
        const rows = await fetchInteriorData();
        const index = rows.findIndex(row => row[0] === name);

        if (index === -1) {
            return res.status(404).json({ success: false, message: `No Interior found with name: ${name}` });
        }

        // Keep existing values if new ones are not provided
        const updatedRow = rows[index].map((value, i) => [
            name, email, phonenumber, address
        ][i] ?? value);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `InteriorData!A${index + 1}:D${index + 1}`,
            valueInputOption: "RAW",
            resource: { values: [updatedRow] },
        });

        return res.status(200).json({ success: true, message: "Interior updated successfully" });
    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// Add a new interior data entry
const sendInteriorData = async (req, res) => {
    const { name, email, phonenumber, address } = req.body;

    if (![name].every(Boolean)) {
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
            return res.status(200).json({ success: false, message: "No interior data found" });
        }
        return res.status(200).json({ success: true, message: "Data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching interior data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

// Delete an interior data entry by email
const deleteInteriorData = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Name is required for deletion" });
    }

    try {
        const rows = await fetchInteriorData();
        const index = rows.findIndex(row => row[0] === name); // Find index based on email

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
module.exports = { sendInteriorData, getInteriorData, deleteInteriorData, fetchInteriorData, updateInteriorData };
