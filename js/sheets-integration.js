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

    // Send data to Vercel Serverless Function
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            return { success: true };
        } else {
            throw new Error(result.error || 'Submission failed');
        }

    } catch (error) {
        console.error('Submission failed:', error);
        return {
            success: false,
            message: 'Failed to submit. Please try again later.'
        };
    }
};
