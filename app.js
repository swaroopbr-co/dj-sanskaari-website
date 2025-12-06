const express = require('express'); // Trigger deployment
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

    // 1. Remove all double quotes (some users paste with quotes)
    privateKey = privateKey.replace(/"/g, '');

    // 2. Replace literal escaped newlines (\n) with actual newlines
    // We use split/join to be safe
    privateKey = privateKey.split('\\n').join('\n');

    // 3. Trim whitespace
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
    token: process.env.SANITY_API_TOKEN // Add token for private datasets
});

// ... (rest of code)

// Debug Endpoint
app.get('/api/debug', async (req, res) => {
    const status = {
        env: {
            PORT: process.env.PORT || 'Not Set (Default 3000)',
            SPREADSHEET_ID: process.env.SPREADSHEET_ID ? 'Set' : 'MISSING',
            GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL ? 'Set' : 'MISSING',

            // Granular Key Checks
            KEY_HAS_HEADER: privateKey ? privateKey.startsWith('-----BEGIN PRIVATE KEY-----') : false,
            KEY_HAS_FOOTER: privateKey ? privateKey.endsWith('-----END PRIVATE KEY-----') : false,
            KEY_FIRST_CHAR_CODE: privateKey ? privateKey.charCodeAt(0) : 'N/A',
            KEY_LAST_CHAR_CODE: privateKey ? privateKey.charCodeAt(privateKey.length - 1) : 'N/A',

            GOOGLE_PRIVATE_KEY_START: privateKey ? privateKey.substring(0, 40).replace(/\n/g, '[NEWLINE]') : 'MISSING',
            GOOGLE_PRIVATE_KEY_END: privateKey ? privateKey.substring(privateKey.length - 40).replace(/\n/g, '[NEWLINE]') : 'MISSING',
            GOOGLE_PRIVATE_KEY_LENGTH: privateKey ? privateKey.length : 0
        },
        sanity: {
            projectId: 'ipk33t5a',
            dataset: 'production',
            token: process.env.SANITY_API_TOKEN ? 'Set' : 'MISSING',
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

// API Endpoint to submit booking
app.post('/api/submit', async (req, res) => {
    try {
        const data = req.body;
        console.log('Received submission:', data);

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

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${SHEET_NAME}'!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [row] },
        });

        res.status(200).json({ success: true, message: 'Success', data: response.data });

    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to get Events (Sanity CMS)
app.get('/api/events', async (req, res) => {
    try {
        const query = '*[_type == "event"]{date, title, location, ticketLink, status} | order(date asc)';
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

// API Endpoint to get Gallery (Sanity CMS)
app.get('/api/gallery', async (req, res) => {
    try {
        const query = `*[_type == "gallery"]{
        type,
        caption,
        "url": select(type == 'video' => videoUrl, image.asset->url),
        "thumbnail": image.asset->url
    } | order(_createdAt desc)`;

        const gallery = await sanity.fetch(query);
        res.json(gallery);
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
