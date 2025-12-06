const { createClient } = require('@sanity/client');

const sanity = createClient({
    projectId: 'ipk33t5a',
    dataset: 'production',
    useCdn: false, // Bypass CDN to see fresh data
    apiVersion: '2023-05-03',
});

async function testSanity() {
    console.log('Testing Sanity Connection...');
    try {
        const events = await sanity.fetch('*[_type == "event"]');
        console.log(`Success! Found ${events.length} events.`);
        events.forEach(e => console.log(`- ${e.title} (${e.date})`));

        const mixes = await sanity.fetch('*[_type == "mix"]');
        console.log(`Success! Found ${mixes.length} mixes.`);
        mixes.forEach(m => console.log(`- ${m.title}`));

    } catch (error) {
        console.error('Sanity Connection Failed:', error.message);
        if (error.statusCode === 401) {
            console.error('Reason: Unauthorized. Your dataset might be PRIVATE.');
            console.error('Fix: Make your dataset PUBLIC or add a token.');
        }
    }
}

testSanity();
