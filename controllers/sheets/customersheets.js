const { sheets } = require("../../db/googleuser");
require("dotenv").config();

const sheetId = process.env.customerSheetId;
const range = "CustomerData!A:C";

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
            requestBody: { values: [[name, phonenumber, address]] },
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
        const rowIndex = rows.findIndex(row => row[0] === name); // Find index based on name

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

const updateCustomerData = async (req, res) => {
    const { name, phonenumber, address } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Customer name is required",
        });
    }

    try {
        const data = await fetchCustomerData(); // Fetch all sales associates
        let index = -1;

        for (let i = 0; i < data.length; i++) {
            if (data[i][0] === name) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            return res.status(400).json({
                success: false,
                message: `No Customer found with the name: ${name}`,
            });
        }

        const updatedCustomer = [
            name,
            phonenumber ?? data[index][1],
            address ?? data[index][2],
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `CustomerData!A${index + 1}:C${index + 1}`,
            valueInputOption: "RAW",
            resource: { values: [updatedCustomer] },
        });

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
        });
    } catch (error) {
        console.error("Error updating Customer:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update Customer",
        });
    }
};


// Export functions
module.exports = { sendCustomerData, deleteCustomerData, getCustomerData, getCustomerSerial, updateCustomerData};
