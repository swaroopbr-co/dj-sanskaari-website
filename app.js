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
const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
let privateKey;
if (rawPrivateKey) {
    privateKey = rawPrivateKey;
    // Remove surrounding quotes (single or double)
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    // Trim whitespace
    privateKey = privateKey.trim();
}

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
    },
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

// Sanity Configuration
const { createClient } = require('@sanity/client');
const sanity = createClient({
    projectId: 'ipk33t5a',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
});

// ... (rest of code)

// Debug Endpoint
app.get('/api/debug', async (req, res) => {
    const status = {
        env: {
            PORT: process.env.PORT || 'Not Set (Default 3000)',
            SPREADSHEET_ID: process.env.SPREADSHEET_ID ? 'Set' : 'MISSING',
            GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL ? 'Set' : 'MISSING',
            GOOGLE_PRIVATE_KEY_FORMAT: privateKey ?
                (privateKey.startsWith('-----BEGIN PRIVATE KEY-----') && privateKey.endsWith('-----END PRIVATE KEY-----') ? 'Valid Header & Footer' : 'Invalid Format') : 'MISSING',
            GOOGLE_PRIVATE_KEY_START: privateKey ? privateKey.substring(0, 40).replace(/\n/g, '[NEWLINE]') : 'MISSING',
            GOOGLE_PRIVATE_KEY_END: privateKey ? privateKey.substring(privateKey.length - 40).replace(/\n/g, '[NEWLINE]') : 'MISSING',
            GOOGLE_PRIVATE_KEY_LENGTH: privateKey ? privateKey.length : 0
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
