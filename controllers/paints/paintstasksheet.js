const { sheets } = require("../../db/googleuser")
require("dotenv").config();

const sheetId = "1xZDRlsW8flyUnZ4bszL0_e9wGYkJL59QXH-WnuIlKFY";
const range = "Tasks!A:H";

// Fetch all task data from the sheet
const fetchPaintsTaskData = async () => {
    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        return response.data.values || [];
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};

// Add a new task
const addPaintsTask = async (req, res) => {
    const { title, description, dateTime, date, assigneeLink, projectLink, priority, status } = req.body;

    if (![title, description, dateTime, date, projectLink, priority, status].every(Boolean)) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            insertDataOption: "INSERT_ROWS",
            valueInputOption: "RAW",
            requestBody: { values: [[title, description, dateTime, date, assigneeLink, projectLink, priority, status]] },
        });

        return res.status(200).json({ success: true, message: "New task added" });
    } catch (error) {
        console.error("Error adding task:", error);
        return res.status(500).json({ success: false, message: "Failed to add task" });
    }
};

// Delete a task by title
const deletePaintsTask = async (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: "Title is required" });
    }

    try {
        const rows = await fetchPaintsTaskData();
        const index = rows.findIndex(row => row[0] === title);

        if (index === -1) {
            return res.status(400).json({ success: false, message: `No task with the title: ${title} found` });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            resource: {
                requests: [{ deleteDimension: { range: { sheetId: 0, dimension: "ROWS", startIndex: index, endIndex: index + 1 } } }]
            }
        });

        return res.status(200).json({ success: true, message: "Task deleted" });
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({ success: false, message: "Failed to delete task" });
    }
};

// Get all tasks
const getPaintsTasks = async (req, res) => {
    try {
        const rows = await fetchPaintsTaskData();
        if (!rows.length) {
            return res.status(200).json({ success: false, message: "No tasks found" });
        }
        return res.status(200).json({ success: true, message: "Tasks retrieved successfully", body: rows });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({ success: false, message: "Failed to retrieve tasks" });
    }
};

// Update a task by title
    const updatePaintsTask = async (req, res) => {
        const { title, description, dateTime, date, assigneeLink, projectLink, priority, status } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }

        try {
            const rows = await fetchPaintsTaskData();
            const index = rows.findIndex(row => row[0] === title);

            if (index === -1) {
                return res.status(400).json({ success: false, message: `No task with the title: ${title} found` });
            }

            const row = rows[index];
            const updatedRow = [
                title,
                description?.trim() ? description : row[1],  // If empty string, keep old value
                dateTime?.trim() ? dateTime : row[2],
                date?.trim() ? date : row[3],
                assigneeLink?.trim() ? assigneeLink : row[4],
                projectLink?.trim() ? projectLink : row[5],
                priority?.trim() ? priority : row[6],
                status?.trim() ? status : row[7],
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: `Tasks!A${index + 1}:H${index + 1}`,
                valueInputOption: "RAW",
                resource: { values: [updatedRow] },
            });

            return res.status(200).json({ success: true, message: "Task updated successfully" });
        } catch (error) {
            console.error("Error updating task:", error);
            return res.status(500).json({ success: false, message: "Failed to update task" });
        }
    };

module.exports = { addPaintsTask, deletePaintsTask, getPaintsTasks, updatePaintsTask };
