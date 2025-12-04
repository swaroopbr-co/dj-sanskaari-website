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

async function addMoreData() {
    try {
        // Add 2 more Events
        console.log('Adding more events...');
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "'Events'!A1",
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    ['Feb 14, 2026', 'Valentine\'s Special', 'Rooftop Bar, Pune', 'https://example.com/tickets'],
                    ['Mar 10, 2026', 'Holi High', 'Open Grounds, Goa', 'https://example.com/tickets']
                ]
            }
        });

        // Add 2 more Mixes
        console.log('Adding more mixes...');
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "'Mixes'!A1",
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    ['Punjabi Power', 'Punjabi', 'https://soundcloud.com/example/punjabi', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=500&auto=format&fit=crop&q=60'],
                    ['Hip Hop Hustle', 'Hip Hop', 'https://soundcloud.com/example/hiphop', 'https://images.unsplash.com/photo-1571266028243-371695039980?w=500&auto=format&fit=crop&q=60']
                ]
            }
        });

        console.log('Data added successfully!');

    } catch (error) {
        console.error('Error adding data:', error);
    }
}

addMoreData();
