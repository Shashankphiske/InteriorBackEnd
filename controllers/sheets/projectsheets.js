const { google } = require("googleapis");
require("dotenv").config();

const credentials = require("../../credentials.json");

const sheetId = process.env.SHEET_ID;
const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT(process.env.client_email, null, process.env.private_key.replace(/\\n/g, "\n"), scopes);
const sheets = google.sheets({ version: "v4", auth });

// Utility function to fetch all project data
const getAllProjectData = async () => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "AllProjects!A:N",
    });
    console.log(response);
    return response.data.values || [];
};

// Utility function to find row index by project name
const findRowIndex = (rows, projectName) => {
    return rows.findIndex(row => row[0] === projectName);
};

// Send Project Data (Insert)
const sendProjectData = async (req, res) => {
    const { projectName, customerLink, projectReference, address, status, amount, received, due, createdBy, interiorPersonLink, salesAssociateLink, allAreaLink, quotationLink } = req.body;

    if (![projectName, customerLink, projectReference, address, status, received, due, createdBy, interiorPersonLink, salesAssociateLink, allAreaLink, quotationLink].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const date = new Date().toISOString().replace("T", " ").slice(0, 19);

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: "AllProjects!A:N",
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [[projectName, customerLink, projectReference, address, status, amount, received, due, createdBy, interiorPersonLink, salesAssociateLink, allAreaLink, quotationLink, date]],
            },
        });

        return res.status(200).json({ success: true, message: "Data sent successfully" });
    } catch (error) {
        console.error("Error inserting project values:", error);
        return res.status(500).json({ success: false, message: "Error inserting project data in sheets" });
    }
};

const getProjectData = async (req, res) => {
    try {
        const rows = await getAllProjectData();
        if (!rows.length) return res.status(400).json({ success: false, message: "No project data available" });
        return res.status(200).json({ success: true, message: "Data Fetched", body: rows });
    } catch (error) {
        console.error("Error retrieving project data:", error);
        return res.status(500).json({ success: false, message: "Error retrieving data from sheets" });
    }
};

// Update Project Values
const updateProjectValues = async (req, res) => {
    const { projectName, ...updatedFields } = req.body;
    if (!projectName) return res.status(400).json({ success: false, message: "Project name needed to update values" });

    try {
        const rows = await getAllProjectData();
        const rowIndex = findRowIndex(rows, projectName);
        if (rowIndex === -1) return res.status(400).json({ success: false, message: "Project not found" });

        const updatedRow = rows[rowIndex].map((value, index) => updatedFields[Object.keys(updatedFields)[index]] ?? value);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `AllProjects!A${rowIndex + 1}:N${rowIndex + 1}`,
            valueInputOption: "RAW",
            resource: { values: [updatedRow] },
        });

        return res.status(200).json({ success: true, message: "Project updated successfully" });
    } catch (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({ success: false, message: "Error updating project data" });
    }
};

// Delete Project Data
const deleteProjectData = async (req, res) => {
    const { projectName } = req.body;
    if (!projectName) return res.status(400).json({ success: false, message: "Project name required" });

    try {
        const rows = await getAllProjectData();
        const rowIndex = findRowIndex(rows, projectName);
        if (rowIndex === -1) return res.status(400).json({ success: false, message: "Project not found" });

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            resource: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: 0,
                            dimension: "ROWS",
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1
                        }
                    }
                }]
            }
        });

        return res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return res.status(500).json({ success: false, message: "Error deleting project data" });
    }
};

module.exports = { sendProjectData, getProjectData, updateProjectValues, deleteProjectData };
