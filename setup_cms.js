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

async function setupCMS() {
    try {
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
        const requests = [];

        // 1. Setup Events Sheet
        if (!existingSheets.includes('Events')) {
            console.log('Adding "Events" sheet...');
            requests.push({
                addSheet: {
                    properties: { title: 'Events' }
                }
            });
        }

        // 2. Setup Mixes Sheet
        if (!existingSheets.includes('Mixes')) {
            console.log('Adding "Mixes" sheet...');
            requests.push({
                addSheet: {
                    properties: { title: 'Mixes' }
                }
            });
        }

        if (requests.length > 0) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                resource: { requests }
            });
            console.log('Sheets created.');
        } else {
            console.log('Sheets "Events" and "Mixes" already exist.');
        }

        // 3. Add Headers and Sample Data for Events
        console.log('Populating "Events"...');
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: "'Events'!A1",
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    ['Date', 'Title', 'Location', 'Ticket Link'], // Header
                    ['Dec 24, 2025', 'Christmas Eve Bash', 'Club Vibe, Mumbai', 'https://example.com/tickets'],
                    ['Dec 31, 2025', 'New Year Extravaganza', 'Grand Hotel, Delhi', 'https://example.com/tickets']
                ]
            }
        });

        // 4. Add Headers and Sample Data for Mixes
        console.log('Populating "Mixes"...');
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: "'Mixes'!A1",
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    ['Title', 'Genre', 'Link', 'Image URL'], // Header
                    ['Summer Vibes 2025', 'House', 'https://soundcloud.com/example/summer', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGp8ZW58MHx8MHx8fDA%3D'],
                    ['Bollywood Blast', 'Bollywood', 'https://soundcloud.com/example/bollywood', 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGp8ZW58MHx8MHx8fDA%3D']
                ]
            }
        });

        console.log('CMS Setup Complete!');

    } catch (error) {
        console.error('Error setting up CMS:', error);
    }
}

setupCMS();
