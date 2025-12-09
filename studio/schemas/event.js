export default {
    name: 'event',
    title: 'Event',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
        },
        {
            name: 'date',
            title: 'Date',
            type: 'date', // Changed from datetime to date
            options: {
                dateFormat: 'YYYY-MM-DD',
            }
        },
        {
            name: 'time',
            title: 'Time',
            type: 'string',
            description: 'e.g., "10:00 PM" or "22:00"'
        },
        {
            name: 'location',
            title: 'Location',
            type: 'string',
        },
        {
            name: 'ticketLink',
            title: 'Ticket Link',
            type: 'url',
        },
        {
            name: 'order',
            title: 'Order',
            type: 'number',
            description: 'Order of appearance (lower numbers first)'
        },
        {
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Coming Soon', value: 'coming' },
                    { title: 'Tickets Available', value: 'available' },
                    { title: 'Filling Fast', value: 'filling' },
                    { title: 'Sold Out', value: 'soldout' },
                    { title: 'Concluded', value: 'concluded' }
                ],
                layout: 'radio'
            },
            initialValue: 'available'
        }
    ],
}
