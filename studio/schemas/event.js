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
            type: 'datetime',
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
