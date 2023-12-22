import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const client = createClient({
  projectId: process.env.SANITY_STUDIO_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-12-13',
  token: process.env.SANITY_SECRET_TOKEN,
  fetch: {
    cache: 'no-store',
  },
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source).width(800).url();
}
