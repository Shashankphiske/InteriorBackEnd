const { google } = require("googleapis");
require("dotenv").config();

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT(process.env.client_email, null, process.env.private_key.replace(/\\n/g, "\n"), scopes);
const sheets = google.sheets({ version: "v4", auth });

module.exports = { sheets };