const { sheets } = require("../../db/googleuser")
require("dotenv").config();

const sheetId = "13AGep4OlQGJFAEClrmjsTxDmlbGxyg1p565d-APF9Lo";
const range = "DesignNo!A:B";

const fetchPaintsDesignData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching design data:", error);
        return [];
    }
};

const sendPaintsDesignData = async (req, res) => {
    const { designName, date } = req.body;

    if (![designName, date].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[designName, date]] },
        });

        return res.status(200).json({ success: true, message: "Design data inserted successfully" });
    } catch (error) {
        console.error("Error inserting design data:", error);
        return res.status(500).json({ success: false, message: "Failed to insert data" });
    }
};

const getPaintsDesignData = async (req, res) => {
    try {
        const rows = await fetchPaintsDesignData();
        if (!rows.length) {
            return res.status(200).json({ success: false, message: "No user data found" });
        }
        return res.status(200).json({ success: true, message: "Design data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching Design data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

const deletePaintsDesignData = async (req, res) => {
    const { designName } = req.body;

    if (!designName) {
        return res.status(400).json({ success: false, message: "Name is required for deletion" });
    }

    try {
        const rows = await fetchPaintsDesignData();
        const rowIndex = rows.findIndex(row => row[0] === designName); // Find index based on name

        if (rowIndex === -1) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            resource: {
                requests: [{
                    deleteDimension: {
                        range: { sheetId: 0, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 }
                    }
                }]
            }
        });

        return res.status(200).json({ success: true, message: "Design deleted successfully" });
    } catch (error) {
        console.error("Error deleting Design data:", error);
        return res.status(500).json({ success: false, message: "Failed to delete data" });
    }
};

module.exports = {
    sendPaintsDesignData,
    getPaintsDesignData,
    deletePaintsDesignData,
};