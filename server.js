const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Google Sheets Configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';

// Authentication
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    },
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

// Helper to ensure sheet exists
async function ensureSheetExists(auth) {
    // For Sheet1, it usually always exists, but we'll keep this safe.
    // We won't force create headers for Sheet1 as the user already has them.
    return true;
}

// API Endpoint to submit booking
app.post('/api/submit', async (req, res) => {
    try {
        const data = req.body;
        console.log('Received submission:', data);

        // Calculate next Serial Number
        // We get the current values to count rows. 
        // Assuming row 1 is headers. Row 2 is Serial 1.
        // So next Serial = (Total Rows)
        // If only headers exist (1 row), next Serial = 1.

        let nextSerial = 1;
        try {
            const rangeData = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `'${SHEET_NAME}'!A:A`, // Get all serial numbers
            });
            const rows = rangeData.data.values;
            if (rows && rows.length > 0) {
                // If headers are present, length is at least 1.
                // Next serial is simply the number of existing rows (assuming contiguous).
                // Example: 1 Header + 0 Data = 1 Row. Next Serial = 1.
                // Example: 1 Header + 1 Data = 2 Rows. Next Serial = 2.
                nextSerial = rows.length;
            }
        } catch (err) {
            console.warn('Could not calculate serial number, defaulting to 1', err);
        }

        // User's Header Order:
        // Serial No | Timestamp | Type | Name | Phone | Email | Event Date | Message

        const row = [
            nextSerial,         // Serial No
            data.timestamp,     // Timestamp
            data.type,          // Type
            data.name,          // Name
            data.phone,         // Phone
            data.email,         // Email
            data.eventDate,     // Event Date
            data.message        // Message
        ];

        // Append to Google Sheet
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${SHEET_NAME}'!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [row],
            },
        });

        res.status(200).json({ message: 'Success', data: response.data });

    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to get Events (Local Testing)
app.get('/api/events', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "'Events'!A2:D",
        });
        const rows = response.data.values || [];
        const events = rows.map(row => ({
            date: row[0],
            title: row[1],
            location: row[2],
            ticketLink: row[3]
        }));
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to get Mixes (Local Testing)
app.get('/api/mixes', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "'Mixes'!A2:D",
        });
        const rows = response.data.values || [];
        const mixes = rows.map(row => ({
            title: row[0],
            genre: row[1],
            link: row[2],
            imageUrl: row[3]
        }));
        res.json(mixes);
    } catch (error) {
        console.error('Error fetching mixes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
