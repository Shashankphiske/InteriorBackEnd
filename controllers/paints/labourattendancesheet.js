const { sheets } = require("../../db/googleuser")
require("dotenv").config();

const sheetId = "1nLUaydzTT1c-4JSAl33kojTXYXhsuTHzB5bHYzgTYXg";
const range = "Sheet1!A:C";

// Utility function to fetch all sales associate data
const fetchLabourData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching Sales Associate data:", error);
        return [];
    }
};

// Add a new sales associate
const sendLabourData = async (req, res) => {
    const { date, siteName, labours } = req.body;

    if (![date, siteName].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[date, siteName, labours]] },
        });

        return res.status(200).json({ success: true, message: "Associate data added successfully" });
    } catch (error) {
        console.error("Error adding sales associate data:", error);
        return res.status(500).json({ success: false, message: "Failed to add associate data" });
    }
};

// Retrieve all sales associates
const getLabourData = async (req, res) => {
    try {
        const rows = await fetchLabourData();
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
const deleteLabourData = async (req, res) => {
    const { date, siteName } = req.body;

    if (!date && !siteName) {
        return res.status(400).json({ success: false, message: "Name is required" });
    }

    try {
        const rows = await fetchLabourData();
        const index = rows.findIndex(row => row[0] === date && row[1] === siteName); // Find index based on email

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

const updateLabourData = async (req, res) => {
    const { date, siteName, labours } = req.body;

    if (!date && !siteName) {
        return res.status(400).json({
            success: false,
            message: "Sales Associate name is required",
        });
    }

    try {
        const data = await fetchLabourData(); // Fetch all sales associates
        let index = -1;

        for (let i = 0; i < data.length; i++) {
            if (data[i][0] === date && data[i][1] == siteName) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            return res.status(400).json({
                success: false,
                message: `No Sales Associate found with the name: ${name}`,
            });
        }

        const updatedSalesAssociate = [
            date,
            siteName ?? data[index][1],
            labours ?? data[index][2]
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Sheet1!A${index + 1}:C${index + 1}`,
            valueInputOption: "RAW",
            resource: { values: [updatedSalesAssociate] },
        });

        return res.status(200).json({
            success: true,
            message: "Sales Associate updated successfully",
        });
    } catch (error) {
        console.error("Error updating Sales Associate:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update Sales Associate",
        });
    }
};


// Export functions
module.exports = { sendLabourData, getLabourData, deleteLabourData, fetchLabourData, updateLabourData };
