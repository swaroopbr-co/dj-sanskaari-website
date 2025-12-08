export default {
    name: 'gallery',
    title: 'Gallery',
    type: 'document',
    fields: [
        {
            name: 'caption',
            title: 'Caption',
            type: 'string',
        },
        {
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Photo', value: 'photo' },
                    { title: 'Video', value: 'video' }
                ],
                layout: 'radio'
            },
            initialValue: 'photo'
        },
        {
            name: 'order',
            title: 'Order',
            type: 'number',
            description: 'Order of appearance (lower numbers first)'
        },
        {
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            hidden: ({ document }) => document?.type === 'video'
        },
        {
            name: 'videoUrl',
            title: 'Video URL',
            type: 'url',
            hidden: ({ document }) => document?.type !== 'video'
        }
    ],
    preview: {
        select: {
            title: 'caption',
            media: 'image'
        }
    }
}
