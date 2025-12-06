import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
    name: 'default',
    title: 'DJ Sanskaari CMS',

    projectId: 'h0su65x0kihvnmsvaxtm1vpu',
    dataset: 'production',

    plugins: [deskTool(), visionTool()],

    schema: {
        types: schemaTypes,
    },
})
