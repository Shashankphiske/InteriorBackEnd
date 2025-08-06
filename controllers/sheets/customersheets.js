const { sheets } = require("../../db/googleuser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let customerData = [];

const sheetId = process.env.customerSheetId;
const range = "CustomerData!A:H";

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
    const { name, phonenumber, email, address, alternatenumber, addedDate, companyName, GST } = req.body;

    if (![name, phonenumber, address].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // let newCustomer = {
    //     "name" : "NA",
    //     "phonenumber" : "00",
    //     "email" : "NA",
    //     "address" : "NA",
    //     "alternatenumber" : "00",
    //     "addedDate" : "NA",
    //     "companyName" : "NA",
    //     "GST" : "NA"
    // }

    // newCustomer.name = (name != null ? name : "NA");
    // newCustomer.phonenumber = (phonenumber != null ? phonenumber : "NA");
    // newCustomer.email = (email != null ? email : "NA");
    // newCustomer.address = (address != null ? address : "NA");
    // newCustomer.alternatenumber = (alternatenumber != null ? alternatenumber : "NA");
    // newCustomer.addedDate = (addedDate != null ? addedDate : "NA");
    // newCustomer.companyName = (companyName != null ? companyName : "NA");
    // newCustomer.GST = (GST != null ? GST : "NA");

    // customerData.push(newCustomer);

    try {
        const srno = (await getCustomerSerial()) + 1;

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
const getCustomerData = async (req, res) => {
    try {
        const rows = await fetchCustomerData();
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
    const { name, phonenumber, email, address, alternatenumber, addedDate, companyName, GST } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Customer name is required",
        });
    }

    try {
        const data = await fetchCustomerData(); // Fetch all tasks
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
            address ?? data[index][2],
            alternatenumber ?? data[index][3],
            addedDate ?? data[index][4],
            companyName ?? data[index][5],
            GST ?? data[index][6]
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
module.exports = { sendCustomerData, deleteCustomerData, getCustomerData, getCustomerSerial, updateCustomerData};
