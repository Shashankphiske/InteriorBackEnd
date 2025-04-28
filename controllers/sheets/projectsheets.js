const { google } = require("googleapis");
require("dotenv").config();

const credentials = require("../../credentials.json");

const sheetId = "1MrNq308z4mQIZXOcxuyGj3SC0TwBePemwilZeLyQ9WI";
const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT(process.env.client_email, null, process.env.private_key.replace(/\\n/g, "\n"), scopes);
const sheets = google.sheets({ version: "v4", auth });

// Utility function to fetch all project data
const getAllProjectData = async () => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "AllProjects!A:R",
    });
    return response.data.values;
};

// Utility function to find row index by project name
const findRowIndex = (rows, projectName) => {
    return rows.findIndex(row => row[0] === projectName);
};

// Send Project Data (Insert)
const sendProjectData = async (req, res) => {
    const { projectName, customerLink, projectReference, status, totalAmount, totalTax, paid, discount, createdBy, allData, projectDate, additionalRequests, interiorArray, salesAssociateArray, additionalItems, goodsArray, tailorsArray, projectAddress } = req.body;
    console.log(projectName);
    console.log(req.body);

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: "AllProjects!A:R",
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [[projectName, customerLink, projectReference, status, totalAmount, totalTax, paid, discount, createdBy, allData, projectDate, additionalRequests, interiorArray, salesAssociateArray, additionalItems, goodsArray, tailorsArray, projectAddress]],
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
        if (!rows) return res.status(400).json({ success: false, message: "No project data available" });
        return res.status(200).json({ success: true, message: "Data Fetched", body: rows });
    } catch (error) {
        console.error("Error retrieving project data:", error);
        return res.status(500).json({ success: false, message: "Error retrieving data from sheets" });
    }
};

// Update Project Values
const updateProjectValues = async (req, res) => {
    const { projectName, ...updatedFields } = req.body;
    console.log(projectName);
    console.log(req.body);
  
    if (!projectName)
      return res.status(400).json({ success: false, message: "Project name needed to update values" });
  
    try {
      const rows = await getAllProjectData();
      const rowIndex = findRowIndex(rows, projectName);
      if (rowIndex === -1)
        return res.status(400).json({ success: false, message: "Project not found" });
  
      const fieldMapping = {
        projectName: 0,
        customerLink: 1,
        projectReference: 2,
        status: 3,
        totalAmount: 4,
        totalTax: 5,
        paid: 6,
        discount: 7,
        createdBy: 8,
        allData: 9,
        projectDate: 10,
        additionalRequests: 11,
        interiorArray: 12,
        salesAssociateArray: 13,
        additionalItems: 14,
        goodsArray: 15,
        tailorsArray: 16,
        projectAddress : 17
      };
  
      const currentRow = rows[rowIndex];
      const updatedRow = [];
  
      for (let field in fieldMapping) {
        const columnIndex = fieldMapping[field];
        const existingValue = currentRow[columnIndex];
  
        let newValue;
  
        if (updatedFields.hasOwnProperty(field)) {
          if (typeof updatedFields[field] === "object") {
            newValue = JSON.stringify(updatedFields[field]); // stringify arrays/objects
          } else {
            newValue = updatedFields[field];
          }
        } else {
          newValue = existingValue;
        }
  
        updatedRow[columnIndex] = newValue;
      }
  
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `AllProjects!A${rowIndex + 1}:R${rowIndex + 1}`,
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
