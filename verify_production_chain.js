const https = require('https');

const VERCEL_URL = 'https://dj-sanskaari-website.vercel.app/api/events';
const DEBUG_URL = 'https://dj-sanskaari-website.vercel.app/api/debug';

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ error: 'Failed to parse JSON', raw: data });
                }
            });
        }).on('error', reject);
    });
}

async function verify() {
    console.log('🔍 Starting End-to-End Verification...\n');

    // 1. Check Debug Endpoint
    console.log('1️⃣  Checking Debug Endpoint...');
    try {
        const debug = await fetchUrl(DEBUG_URL);
        console.log('   Status:', debug.sanity.connection);
        console.log('   Project ID:', debug.sanity.projectId);
        console.log('   Token Set:', debug.sanity.token);
    } catch (e) {
        console.log('   ❌ Failed to reach debug endpoint:', e.message);
    }

    // 2. Check Events API
    console.log('\n2️⃣  Checking Public Events API...');
    try {
        const events = await fetchUrl(VERCEL_URL);
        if (Array.isArray(events)) {
            console.log(`   ✅ Success! Found ${events.length} events exposed to the frontend.`);
            if (events.length > 0) {
                console.log('   📅 Latest Event:', events[0].title);
            } else {
                console.log('   ⚠️  API works but returned 0 events. The Studio is empty.');
            }
        } else {
            console.log('   ❌ API returned unexpected data:', events);
        }
    } catch (e) {
        console.log('   ❌ Failed to reach events API:', e.message);
    }

    // 3. Check Mixes API
    console.log('\n3️⃣  Checking Public Mixes API...');
    try {
        const mixes = await fetchUrl('https://dj-sanskaari-website.vercel.app/api/mixes');
        if (Array.isArray(mixes)) {
            console.log(`   ✅ Success! Found ${mixes.length} mixes exposed to the frontend.`);
            if (mixes.length > 0) {
                console.log('   🎧 Latest Mix:', mixes[0].title);
            } else {
                console.log('   ⚠️  API works but returned 0 mixes. The Studio is empty.');
            }
        } else {
            console.log('   ❌ API returned unexpected data:', mixes);
        }
    } catch (e) {
        console.log('   ❌ Failed to reach mixes API:', e.message);
    }

    // 4. Check Gallery API
    console.log('\n4️⃣  Checking Public Gallery API...');
    try {
        const gallery = await fetchUrl('https://dj-sanskaari-website.vercel.app/api/gallery');
        if (Array.isArray(gallery)) {
            console.log(`   ✅ Success! Found ${gallery.length} gallery items exposed to the frontend.`);
            if (gallery.length > 0) {
                console.log('   🖼️  Latest Item:', gallery[0].caption || 'No Caption');
            } else {
                console.log('   ⚠️  API works but returned 0 items.');
            }
        } else {
            console.log('   ❌ API returned unexpected data:', gallery);
        }
    } catch (e) {
        console.log('   ❌ Failed to reach gallery API:', e.message);
    }
}

verify();
