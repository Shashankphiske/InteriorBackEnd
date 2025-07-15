const { sheets } = require("../../db/googleuser")
require("dotenv").config();

const sheetId = "1Qvl7V3Ps3pr-ChZY-fKFgYA6O9QzhW4UVY141tBrLGM";
const range = "Sheet1!A:F";

const fetchPaintsPaymentsData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching interior data:", error);
        return [];
    }
};


const fetchPaintsPaymentData = async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return res.status(200).json({success : "true", message : response.data.values})
    } catch (error) {
        console.error("Error fetching interior data:", error);
        return res.status(400).json({ success : "false" });
    }
};

const sendPaintsPaymentData = async (req, res) => {
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
const updatePaintsPaymentData = async (req, res) => {
    const {customerName, Name, Received, ReceivedDate, PaymentMode, Remarks } = req.body;

    if (!Name && !customerName) {
        return res.status(400).json({ success: false, message: "Title is required" });
    }

    try {
        const rows = await fetchPaintsPaymentsData();
        const index = rows.findIndex(row => row[0] === customerName && row[1] == Name);

        if (index === -1) {
            return res.status(404).json({ success: false, message: `No Payment found with customer name: ${customerName}` });
        }

        // Keep existing values if new ones are not provided
        const updatedRow = rows[index].map((value, i) => [
            customerName, Name, Received, ReceivedDate, PaymentMode, Remarks
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

const deletePaintsPaymentData = async (req, res) => {
    const { customerName, Name, Received, ReceivedDate, PaymentMode, Remarks } = req.body;

    try {
        const rows = await fetchPaintsPaymentsData();
        const index = rows.findIndex(row =>
  (row[0] === customerName) &&
  (row[1] === Name) &&
  (row[2]?.toLowerCase() === Received?.toLowerCase()) &&
  (row[3]?.toLowerCase() === ReceivedDate?.toLowerCase()) &&
  (row[4]?.toLowerCase() === PaymentMode?.toLowerCase()) &&
  (row[5]?.toLowerCase() === Remarks?.toLowerCase())
);
 // Find index based on email

        if (index === -1) {
            return res.status(400).json({ success: false, message: "No Payment found", data : rows });
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

module.exports = { deletePaintsPaymentData, sendPaintsPaymentData, fetchPaintsPaymentData, updatePaintsPaymentData }