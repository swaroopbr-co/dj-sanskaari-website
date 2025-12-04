const { google } = require('googleapis');

// Helper to clean private key
const getPrivateKey = () => {
    const key = process.env.GOOGLE_PRIVATE_KEY;
    return key ? key.replace(/\\n/g, '\n') : undefined;
};

// Initialize Auth
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: getPrivateKey(),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;

        // Calculate next Serial Number
        let nextSerial = 1;
        try {
            const rangeData = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `'${SHEET_NAME}'!A:A`,
            });
            const rows = rangeData.data.values;
            if (rows && rows.length > 0) {
                nextSerial = rows.length;
            }
        } catch (err) {
            console.warn('Could not calculate serial number, defaulting to 1', err);
        }

        // Prepare row data
        // Serial No | Timestamp | Type | Name | Phone | Email | Event Date | Message
        const row = [
            nextSerial,
            data.timestamp,
            data.type,
            data.name,
            data.phone,
            data.email,
            data.eventDate,
            data.message
        ];

        // Append to Google Sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${SHEET_NAME}'!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [row],
            },
        });

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
