const { sheets } = require("../../db/googleuser");
require("dotenv").config();

const sheetId = "1CjPyUlcUBiLivjwKtwB6Z_UmTYmap_Oh1m9uXqC_jAw";
const range = "Sheet1!A:A"

const fetchAllAreas = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching areas data:", error);
        return [];
    }
};

const sendAllAreas = async (req, res) => {
    const { name } = req.body;

    // Ensure the name is provided
    if (![name].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        // Fetch the existing areas data from the sheet
        const existingAreas = await fetchAllAreas();

        // Check if the name already exists in the fetched areas
        const areaExists = existingAreas.some((area) => area[0].toLowerCase() === name.toLowerCase());

        if (areaExists) {
            return res.status(400).json({ success: false, message: "Area already exists in the database" });
        }

        // If not, append the new name to the spreadsheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[name]] },
        });

        return res.status(200).json({ success: true, message: "Area data added successfully" });
    } catch (error) {
        console.error("Error adding area data:", error);
        return res.status(500).json({ success: false, message: "Failed to add area data" });
    }
};


const getAllAreas = async (req, res) => {
    try {
        const rows = await fetchAllAreas();
        if (!rows.length) {
            return res.status(400).json({ success: false, message: "No areas data found" });
        }
        return res.status(200).json({ success: true, message: "Data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching areas data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

const deleteAreasData = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" });
    }

    try {
        const rows = await fetchAllAreas();
        const index = rows.findIndex(row => row[0] === name); // Find index based on email

        if (index === -1) {
            return res.status(400).json({ success: false, message: "No area found" });
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

        return res.status(200).json({ success: true, message: "Area deleted successfully" });
    } catch (error) {
        console.error("Error deleting area:", error);
        return res.status(500).json({ success: false, message: "Failed" });
    }
};

module.exports = { deleteAreasData, fetchAllAreas, sendAllAreas, getAllAreas }