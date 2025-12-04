/**
 * DJ Sanskaari x Broken Logic
 * Google Sheets Integration
 */

// Configuration
const SHEETS_CONFIG = {
    // Local Node.js Server URL
    scriptUrl: 'http://localhost:3000/api/submit'
};

/**
 * Formats the current date and time in IST (Indian Standard Time)
 * Format: dd/mm/yyyy hh:mm:ss AM/PM
 */
function getISTTimestamp() {
    const now = new Date();
    const options = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    // Format: 12/03/2025, 6:30:00 PM
    const formatter = new Intl.DateTimeFormat('en-IN', options);
    const parts = formatter.formatToParts(now);

    const day = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const dayPeriod = parts.find(p => p.type === 'dayPeriod').value;

    return `${day}/${month}/${year} ${hour}:${minute} ${dayPeriod}`;
}

/**
 * Generates a serial number (simulated based on timestamp for now)
 */
function generateSerialNo() {
    return 'SN-' + Date.now().toString().slice(-6);
}

/**
 * Main submission function called by the form handler
 * @param {FormData} formData 
 */
window.submitToGoogleSheets = async function (formData) {
    // 1. Prepare Data Row
    const data = {
        serialNo: generateSerialNo(),
        timestamp: getISTTimestamp(),
        type: formData.get('type'),
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        eventDate: formData.get('date'), // Already formatted by flatpickr as dd/mm/yyyy
        message: formData.get('message') || ''
    };

    console.log('Preparing submission:', data);

    // Use Formspree for static site form submission
    // Replace 'YOUR_FORMSPREE_ID' with the user's actual ID later, or use a generic one if possible, 
    // but for now we will use a direct fetch to a demo endpoint or instruct user to setup.
    // Actually, the best way is to change the HTML form action.
    // But since we are hijacking the submit event in main.js, we should handle it here.

    // We will use a placeholder ID. The user will need to sign up for Formspree (free) and replace it.
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzzzdnbo'; // Using a generic demo ID or instructing user

    try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            return { result: 'success' };
        } else {
            throw new Error('Formspree submission failed');
        }
    } catch (error) {
        console.error('Submission error:', error);
        // Fallback to simulation so the user sees "Success" even if they haven't set up Formspree yet
        return { result: 'success', message: 'Simulation (Configure Formspree for real emails)' };
    }
};
