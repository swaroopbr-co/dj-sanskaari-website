const { google } = require('googleapis');

const getPrivateKey = () => {
    const key = process.env.GOOGLE_PRIVATE_KEY;
    return key ? key.replace(/\\n/g, '\n') : undefined;
};

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: getPrivateKey(),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Mixes';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${SHEET_NAME}'!A2:D`, // Skip header
        });

        const rows = response.data.values || [];
        // Map rows to objects
        // Columns: Title, Genre, Link, ImageUrl
        const mixes = rows.map(row => ({
            title: row[0],
            genre: row[1],
            link: row[2],
            imageUrl: row[3]
        }));

        res.status(200).json(mixes);
    } catch (error) {
        console.error('Error fetching mixes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
