const { sheets } = require("../../db/googleuser");
require("dotenv").config();

const sheetId = "1NLJjcGPKT6z7UDXuq4FlJCA2gOJCG9dp7gSAnXW0j6o";
const range = "Sheet1!A:H";

// Utility function to fetch all interior data
const fetchBankDetailsData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching bank data:", error);
        return [];
    }
};

const updateBankData = async (req, res) => {
    const { bankName, accountName, branch, pincode, accountNumber, ifscCode, accountType, date } = req.body;

    if (!bankName && !accountName) {
        return res.status(400).json({ success: false, message: "Title is required" });
    }

    try {
        const rows = await fetchBankDetailsData();
        const index = rows.findIndex(row => row[0] === bankName && row[1] == accountName);

        if (index === -1) {
            return res.status(404).json({ success: false, message: `No bank data found with name: ${accountName}` });
        }

        // Keep existing values if new ones are not provided
        const updatedRow = rows[index].map((value, i) => [
            bankName, accountName, branch, pincode, accountNumber, ifscCode, accountType
        ][i] ?? value);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Sheet1!A${index + 1}:H${index + 1}`,
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
const sendBankData = async (req, res) => {
    const { bankName, accountName, branch, pincode, accountNumber, ifscCode, accountType, date } = req.body;

    if (![bankName].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[bankName, accountName, branch, pincode, accountNumber, ifscCode, accountType, date]] },
        });

        return res.status(200).json({ success: true, message: "Data sent successfully" });
    } catch (error) {
        console.error("Error adding Bank data:", error);
        return res.status(500).json({ success: false, message: "Failed to add data" });
    }
};

// Retrieve all interior data
const getBankDetails = async (req, res) => {
    try {
        const rows = await fetchBankDetailsData();
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
const deleteBankData = async (req, res) => {
    const { bankName, accountName } = req.body;

    if (!bankName && !accountName) {
        return res.status(400).json({ success: false, message: "Name is required for deletion" });
    }

    try {
        const rows = await fetchBankDetailsData();
        const index = rows.findIndex(row => row[0] === bankName && row[1] == accountName); // Find index based on email

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
module.exports = { sendBankData, updateBankData, deleteBankData, getBankDetails };
