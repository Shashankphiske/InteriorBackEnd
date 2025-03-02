const { google } = require("googleapis");
require("dotenv").config();

const credentials = require("../../credentials.json");

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT(credentials.client_email, null, credentials.private_key, scopes);
const sheets = google.sheets({ version: "v4", auth });

const sheetId = process.env.customerSheetId;
const range = "CustomerData!A:D";

// Utility function to fetch all customer data
const fetchCustomerData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching customer data:", error);
        return [];
    }
};

// Get customer serial number (row count)
const getCustomerSerial = async () => {
    const rows = await fetchCustomerData();
    return rows.length;
};

// Add a new customer entry
const sendCustomerData = async (req, res) => {
    const { name, phonenumber, address } = req.body;

    if (![name, phonenumber, address].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const srno = (await getCustomerSerial()) + 1;

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[srno, name, phonenumber, address]] },
        });

        return res.status(200).json({ success: true, message: "Customer data inserted successfully" });
    } catch (error) {
        console.error("Error inserting customer data:", error);
        return res.status(500).json({ success: false, message: "Failed to insert data" });
    }
};

// Retrieve all customer data
const getCustomerData = async (req, res) => {
    try {
        const rows = await fetchCustomerData();
        if (!rows.length) {
            return res.status(400).json({ success: false, message: "No user data found" });
        }
        return res.status(200).json({ success: true, message: "Customer data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching customer data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

// Delete a customer entry by name
const deleteCustomerData = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Name is required for deletion" });
    }

    try {
        const rows = await fetchCustomerData();
        const rowIndex = rows.findIndex(row => row[1] === name); // Find index based on name

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

// Fetch all customer data (for internal use)
const CustomerData = async () => fetchCustomerData();

// Export functions
module.exports = { sendCustomerData, deleteCustomerData, getCustomerData, getCustomerSerial, CustomerData };
