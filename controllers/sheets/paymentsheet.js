const { sheets } = require("../../db/googleuser");
require("dotenv").config();

const sheetId = "1hzBAkEW58OdWMMPj1uytARJUACiAWgSI0T6Xbcq9w-8";
const range = "Sheet1!A:F";

const fetchPaymentsData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching interior data:", error);
        return [];
    }
};


const fetchPaymentData = async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return res.status(200).json({success : "true", message : response.data.values})
    } catch (error) {
        console.error("Error fetching interior data:", error);
        return res.status(400).json({ success : "false" });
    }
};

const sendPaymentData = async (req, res) => {
    const { customerName, Name, Received, ReceivedDate, PaymentMode, Remarks } = req.body;

    if (![customerName, Name, Received, ReceivedDate, PaymentMode, Remarks].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [[customerName, Name, Received, ReceivedDate, PaymentMode, Remarks]] },
        });

        return res.status(200).json({ success: true, message: "Data sent successfully" });
    } catch (error) {
        console.error("Error adding interior data:", error);
        return res.status(500).json({ success: false, message: "Failed to add data" });
    }
};
const updatePaymentData = async (req, res) => {
    const {customerName, Name, Received, ReceivedDate, PaymentMode, Remarks } = req.body;

    if (!Name) {
        return res.status(400).json({ success: false, message: "Title is required" });
    }

    try {
        const rows = await fetchPaymentsData();
        const index = rows.findIndex(row => row[0] === name);

        if (index === -1) {
            return res.status(404).json({ success: false, message: `No Interior found with name: ${name}` });
        }

        // Keep existing values if new ones are not provided
        const updatedRow = rows[index].map((value, i) => [
            Received, ReceivedDate, PaymentMode, Remarks
        ][i] ?? value);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Sheet1!A${index + 1}:F${index + 1}`,
            valueInputOption: "RAW",
            resource: { values: [updatedRow] },
        });

        return res.status(200).json({ success: true, message: "Interior updated successfully" });
    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deletePaymentData = async (req, res) => {
    const { customerName, Name, Received, ReceivedDate, PaymentMode, Remarks } = req.body;

    try {
        const rows = await fetchPaymentsData();
        const index = rows.findIndex(row => row[0] === customerName && row[1] === Name && row[2] == Received && row[3] == ReceivedDate && row[4] == PaymentMode && row[5] == Remarks); // Find index based on email

        if (index === -1) {
            return res.status(400).json({ success: false, message: "No Payment found" });
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

        return res.status(200).json({ success: true, message: "Payment data deleted" });
    } catch (error) {
        console.error("Error deleting interior data:", error);
        return res.status(500).json({ success: false, message: "Failed to delete data" });
    }
};

module.exports = { deletePaymentData, sendPaymentData, fetchPaymentData, updatePaymentData }