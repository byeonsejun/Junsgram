import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'junsgram',
  projectId: process.env.SANITY_STUDIO_SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_SANITY_DATASET || '',
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
