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
