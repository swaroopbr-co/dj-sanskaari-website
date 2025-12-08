export default {
    name: 'mix',
    title: 'Mix',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
        },
        {
            name: 'genre',
            title: 'Genre',
            type: 'string',
        },
        {
            name: 'order',
            title: 'Order',
            type: 'number',
            description: 'Order of appearance (lower numbers first)'
        },
        {
            name: 'link',
            title: 'Link',
            type: 'url',
        },
        {
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
    ],
}
