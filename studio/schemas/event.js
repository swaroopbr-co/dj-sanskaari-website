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
    ],
}
