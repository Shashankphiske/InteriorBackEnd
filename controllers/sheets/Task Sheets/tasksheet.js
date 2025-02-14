const express = require("express");
require("dotenv").config();
const { google } = require("googleapis");

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const credentials = require("../../../credentials.json");
const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    scopes,
);
const sheets = google.sheets({version : "v4", auth});

const range = "Tasks!A:H";

const sheetId = process.env.tasksheetid;

const addTask = async (req, res) => {
    const { title, description, date, time, assigneeLink, projectLink, priority, status } = req.body;

    if(!title || !description || !date || !time || !assigneeLink || !projectLink || !priority || !status){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range : range,
        insertDataOption : "INSERT_ROWS",
        valueInputOption : "RAW",
        requestBody : {
            values : [[ title, description, date, time, assigneeLink, projectLink, priority, status ]],
        }
    });

    return res.status(200).json({
        success : true,
        message : "New task added",
    });
}

const deleteTask = async (req, res) => {
    const { title } = req.body;

    if(!title){
        return res.status(400).json({
            success : false,
            message : "Title is required",
        });
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    const rows = response.data.values;
    if(rows == undefined){
        return res.status(400).json({
            success : false,
            message : "No data available in Tasks database",
        });
    }

    let index = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == title){
            index = i;
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No task with the name : ${title} found`,
        });
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId : sheetId,
        resource : {
            requests : [
                {
                    deleteDimension : {
                        range : {
                            sheetId : 0,
                            dimension : "ROWS",
                            startIndex : index,
                            endIndex : index + 1,
                        }
                    }
                }
            ]
        }
    });

    return res.status(200).json({
        success : true,
        message : "Task deleted",
    });
}

const getTasks = async (req, res) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    return res.status(200).json({
        success : true,
        message : "Data fetched from tasks database",
        body : response.data.values,
    });
}

const updateTask = async (req, res) => {
    const { title, description, date, time, assigneeLink, projectLink, priority, status } = req.body;

    if(!title){
        return res.status(400).json({
            success : false,
            message : "Title is required",
        });
    }

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId : sheetId,
        range : range,
    });

    const rows = response.data.values;

    if(rows == undefined){
        return res.status(400).json({
            success : false,
            message : "No data found in the tasks database",
        });
    }

    let index = -1;
    let row = -1;

    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == title){
            index = i + 1;
            row = rows[i];
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No task with the name : ${title} found`,
        });
    }

    const newrow = [
        title,
        description ?? row[1],
        date ?? row[2],
        time ?? row[3],
        assigneeLink ?? row[4],
        projectLink ?? row[5],
        priority ?? row[6],
        status ?? row[7],
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId : sheetId,
        range : `Tasks!A${index}:H${index}`,
        valueInputOption : "RAW",
        resource : {
            values : [newrow],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Task data updated",
    });
}

module.exports = { addTask, deleteTask, getTasks, updateTask };