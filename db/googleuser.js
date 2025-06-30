const { google } = require("googleapis");
require("dotenv").config();

console.log(process.env.client_email);

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT(process.env.client_email, null, process.env.private_key, scopes);
const sheets = google.sheets({ version: "v4", auth });

module.exports = { sheets };