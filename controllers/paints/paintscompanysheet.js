const { sheets } = require("../../db/googleuser")
require("dotenv").config();

const sheetId = "1au1aR8aBXzQrHGyrmlMy3afxV083UIZDm-njkTIp4Ac";
const range = "Company!A:B";

const fetchPaintsCompanyData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching company data:", error);
        return [];
    }
};

const sendPaintsCompanyData = async (req, res) => {
    const { companyName, date } = req.body;

    if (![companyName, date].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[companyName, date]] },
        });

        return res.status(200).json({ success: true, message: "Compnay data inserted successfully" });
    } catch (error) {
        console.error("Error inserting company data:", error);
        return res.status(500).json({ success: false, message: "Failed to insert data" });
    }
};

const getPaintsCompanyData = async (req, res) => {
    try {
        const rows = await fetchPaintsCompanyData();
        if (!rows.length) {
            return res.status(400).json({ success: false, message: "No user data found" });
        }
        return res.status(200).json({ success: true, message: "Customer data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching customer data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

const deletePaintsCompanyData = async (req, res) => {
    const { companyName } = req.body;

    if (!companyName) {
        return res.status(400).json({ success: false, message: "Name is required for deletion" });
    }

    try {
        const rows = await fetchPaintsCustomerData();
        const rowIndex = rows.findIndex(row => row[0] === companyName); // Find index based on name

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

        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting customer data:", error);
        return res.status(500).json({ success: false, message: "Failed to delete data" });
    }
};

module.exports = {
    sendPaintsCompanyData,
    getPaintsCompanyData,
    deletePaintsCompanyData,
};