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

// Sanity Configuration
const { createClient } = require('@sanity/client');
const sanity = createClient({
    projectId: 'ipk33t5a',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
});

// API Endpoint to get Events (Sanity CMS)
app.get('/api/events', async (req, res) => {
    try {
        const query = '*[_type == "event"]{date, title, location, ticketLink} | order(date asc)';
        const events = await sanity.fetch(query);
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to get Mixes (Sanity CMS)
app.get('/api/mixes', async (req, res) => {
    try {
        const query = '*[_type == "mix"]{title, genre, link, "imageUrl": image.asset->url} | order(_createdAt desc)';
        const mixes = await sanity.fetch(query);
        res.json(mixes);
    } catch (error) {
        console.error('Error fetching mixes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Debug Endpoint
app.get('/api/debug', async (req, res) => {
    const status = {
        env: {
            PORT: process.env.PORT || 'Not Set (Default 3000)',
            SPREADSHEET_ID: process.env.SPREADSHEET_ID ? 'Set' : 'MISSING',
            GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL ? 'Set' : 'MISSING',
            GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? (process.env.GOOGLE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY') ? 'Valid Format' : 'Invalid Format') : 'MISSING',
        },
        sanity: {
            projectId: 'ipk33t5a',
            dataset: 'production',
            connection: 'Pending'
        },
        sheets: {
            connection: 'Pending'
        }
    };

    // Test Sanity
    try {
        const count = await sanity.fetch('count(*[_type == "event"])');
        status.sanity.connection = `Success (Found ${count} events)`;
    } catch (err) {
        status.sanity.connection = `Failed: ${err.message}`;
    }

    // Test Sheets
    try {
        await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        status.sheets.connection = 'Success';
    } catch (err) {
        status.sheets.connection = `Failed: ${err.message}`;
    }

    res.json(status);
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
