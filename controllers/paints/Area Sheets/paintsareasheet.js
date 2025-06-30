const { sheets } = require("../../../db/googleuser");
require("dotenv").config();
const { addPaintsAreaMap, getPaintsAreaMap } = require("./paintsareamap");

const sheetId = "1lwOHBzBX788TMaiSXp5AKbrt_h9_ZgUAiLpViWI_K-s";
let range = "{areaName}!A:F";


const addPaintsNewSheet = async (areaName) => {
    const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId : sheetId,
        resource : {
            requests : [{ addSheet : { properties : { title : areaName } } }],
        }
    });

    const newSheetId = response.data.replies[0].addSheet.properties.sheetId;
    return newSheetId;
}

const addPaintsDataToArea = async (req, res) => {
    const { areaName, projectName, productGroup, company, catalogue, designNumber, imageReference, actions } = req.body;

    if(!areaName || !projectName || !productGroup || !company || !catalogue || !designNumber || !imageReference || !actions){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    let newSheetId = await getPaintsAreaMap(areaName);

    if(newSheetId == -1){
        newSheetId = await addPaintsNewSheet(areaName);
        await addPaintsAreaMap(areaName, newSheetId)
    }

    const newrange = range.replace("{areaName}", areaName);

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId : sheetId,
        range : newrange,
        valueInputOption : "RAW",
        insertDataOption : "INSERT_ROWS",
        requestBody : {
            values : [[projectName, productGroup, company, designNumber, imageReference, actions]]
        }
    })

    return res.status(200).json({
        success : true,
        message : `Data added in ${areaName}`,
    });
}

const removePaintsDataFromArea = async (req, res) => {
    const { areaName, projectName } = req.body;

    if(!areaName || !projectName){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    let newsheetId = await getAreaMap(areaName);

    if(newsheetId == -1){
        return res.status(400).json({
            success : false,
            message : "Area doesnt exist",
        });
    }

    const newrange = range.replace("{areaName}", areaName);

    try{
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId : sheetId,
            range : newrange,
        });

        const rows = response.data.values;
        let index = -1;

        if(rows === undefined){
            return res.status(400).json({
                success : false,
                message : `No data available in ${areaName}`,
            })
        }

        for(let i = 0; i < rows.length; i++){
            if(rows[i][0] == projectName){
                index = i;
                break;
            }
        }

        if(index == -1){
            return res.status(400).json({
                success : false,
                message : "No project found",
            });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId : sheetId,
            resource : {
                requests : [
                    {
                        deleteDimension : {
                            range : {
                                sheetId : newsheetId,
                                dimension : "ROWS",
                                startIndex : index,
                                endIndex : index+1,
                            }
                        }
                    }
                ]
            }
        });

        return res.status(200).json({
            success : true,
            message : "Project from area deleted successfully",
        })
    }
    catch(error){
        console.log("Error in deleting area sheet data :", error);
        return res.status(400).json({
            success : false,
            message : "Project name does'nt exist",
        })
    }
}

const getPaintsDataFromArea = async (req, res) => {
    const { areaName } = req.body;
    
    if(!areaName){
        return res.status(400).json({
            success : false,
            message : "All fields are required",
        });
    }

    const newrange = range.replace("{areaName}", areaName);

    try{
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId : sheetId,
            range : newrange,
        });

        const rows = response.data.values;

        return res.status(200).json({
            success : true,
            message :  `Data fetched from ${areaName} successfully`,
            body : rows,
        });
    }
    catch(error){
        return res.status(400).json({
            success : false,
            message :  `No area named as ${areaName} found`,
        });
    }
}

const updatePaintsDataOfArea = async (req, res) => {
    const { areaName, projectName, productGroup, company, designNumber, imageReference, actions } = req.body;

    if(!areaName || !projectName){
        return res.status(400).json({
            success : false,
            message : "Area name and project name area required",
        });
    }

    let newrange = range.replace("{areaName}", areaName);
    let response = -1;

    try{
        response = await sheets.spreadsheets.values.get({
            spreadsheetId : sheetId,
            range : newrange,
        });
    }
    catch(error){
        return res.status(400).json({
            success : false,
            message : `No database with the name ${areaName} found`,
        });
    }

    const rows = response.data.values;

    if(rows.length == 0){
        return res.status(400).json({
            success : false,
            message : `No data found in the ${areaName} database`,
        });
    }

    let index = -1;
    const row = -1;
    for(let i = 0; i < rows.length; i++){
        if(rows[i][0] == projectName){
            index = i + 1;
            row = rows[i];
            break;
        }
    }

    if(index == -1){
        return res.status(400).json({
            success : false,
            message : `No project with the name ${projectName} found`,
        });
    }

    const newrow = [
        projectName,
        productGroup ?? row[1],
        company ?? rows[2],
        designNumber ?? row[3],
        imageReference ?? row[4],
        actions ?? row[5],
    ]

    newrange = `${areaName}!A${index}:F${index}`

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId : sheetId,
        range : newrange,
        valueInputOption : "RAW",
        resource : {
            values : [newrow],
        }
    });

    return res.status(200).json({
        success : true,
        message : "Data updated successfully",
    });

}


module.exports = { addPaintsDataToArea, removePaintsDataFromArea, getPaintsDataFromArea, updatePaintsDataOfArea };