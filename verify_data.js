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

async function verifyLastRow() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${SHEET_NAME}'!A:H`, // Read columns A to H
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No data found.');
            return;
        }

        const lastRow = rows[rows.length - 1];
        console.log('Last Row Data:');
        console.log(`Serial No: ${lastRow[0]} (Type: ${typeof lastRow[0]})`);
        console.log(`Timestamp: ${lastRow[1]}`);
        console.log(`Type: ${lastRow[2]}`);
        console.log(`Name: ${lastRow[3]}`);
        console.log(`Phone: ${lastRow[4]}`);
        console.log(`Email: ${lastRow[5]}`);
        console.log(`Event Date: ${lastRow[6]}`);
        console.log(`Message: ${lastRow[7]}`);

    } catch (error) {
        console.error('Error verifying data:', error.message);
    }
}

verifyLastRow();
