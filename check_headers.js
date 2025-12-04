const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';

async function checkHeaders() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${SHEET_NAME}'!A1:Z1`, // Read first row
        });

        const headers = response.data.values ? response.data.values[0] : [];
        console.log('Actual Headers in Sheet1:');
        headers.forEach((header, index) => {
            console.log(`${index}: ${header}`);
        });
    } catch (error) {
        console.error('Error reading headers:', error.message);
    }
}

checkHeaders();
