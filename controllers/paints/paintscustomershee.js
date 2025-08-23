const { sheets } = require("../../db/googleuser")
require("dotenv").config();

const sheetId = "1pmqO7cmJrrLslWKn_m2SlRaYrWvD1UnID0wi13BDEEg";
const range = "CustomerData!A:H";

// Utility function to fetch all customer data
const fetchPaintsCustomerData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching customer data:", error);
        return [];
    }
};

// Get customer serial number (row count)
const getPaintsCustomerSerial = async () => {
    const rows = await fetchPaintsCustomerData();
    return rows.length;
};

// Add a new customer entry
const sendPaintsCustomerData = async (req, res) => {
    const { name, phonenumber, email, address, alternatenumber, addedDate, companyName, GST } = req.body;

    if (![name, phonenumber, address].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const srno = (await getPaintsCustomerSerial()) + 1;

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[name, phonenumber, email, address, alternatenumber, addedDate, companyName, GST]] },
        });

        return res.status(200).json({ success: true, message: "Customer data inserted successfully" });
    } catch (error) {
        console.error("Error inserting customer data:", error);
        return res.status(500).json({ success: false, message: "Failed to insert data" });
    }
};

// Retrieve all customer data
const getPaintsCustomerData = async (req, res) => {
    try {
        const rows = await fetchPaintsCustomerData();
        if (!rows.length) {
            return res.status(200).json({ success: false, message: "No user data found" });
        }
        return res.status(200).json({ success: true, message: "Customer data fetched successfully", body: rows });
    } catch (error) {
        console.error("Error fetching customer data:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};

// Delete a customer entry by name
const deletePaintsCustomerData = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Name is required for deletion" });
    }

    try {
        const rows = await fetchPaintsCustomerData();
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

const updatePaintsCustomerData = async (req, res) => {
    const { name, phonenumber, email, address, alternatenumber, addedDate, companyName, GST } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Customer name is required",
        });
    }

    try {
        const data = await fetchPaintsCustomerData(); // Fetch all tasks
        let index = -1;

        for (let i = 0; i < data.length; i++) {
            if (data[i][0] == name) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            return res.status(400).json({
                success: false,
                message: `No task found with the title: ${title}`,
            });
        }

        const updatedCustomer = [
            name,
            phonenumber ?? data[index][1],
            email ?? data[index][2],
            address ?? data[index][3],
            alternatenumber ?? data[index][4],
            addedDate ?? data[index][5],
            companyName ?? data[index][6],
            GST ?? data[index][7]
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `CustomerData!A${index + 1}:H${index + 1}`,
            valueInputOption: "RAW",
            resource: { values: [updatedCustomer] },
        });

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
        });
    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update Customer",
        });
    }
};



// Export functions
module.exports = { sendPaintsCustomerData, deletePaintsCustomerData, getPaintsCustomerData, getPaintsCustomerSerial, updatePaintsCustomerData};
