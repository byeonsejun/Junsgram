// Dummy post seeder for local development / pagination testing.
//
// Usage (loads .env.local via Node's --env-file):
//   npm run seed                 # create 30 posts authored by ADMIN_ID
//   npm run seed -- --count=12   # create 12 posts
//   npm run seed -- --user=someUsername
//   npm run seed -- --clean      # delete everything this script created
//
// Requires a Sanity *write* (Editor) token in SANITY_SECRET_TOKEN — the same
// token the app uses for mutations. Seeded docs are tagged `seeded: true` so
// `--clean` can remove exactly what was added without touching real data.

import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_STUDIO_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_SANITY_DATASET;
const token = process.env.SANITY_SECRET_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    'Missing Sanity env vars. Run with `node --env-file=.env.local` and ensure\n' +
      'SANITY_STUDIO_SANITY_PROJECT_ID, SANITY_STUDIO_SANITY_DATASET, and SANITY_SECRET_TOKEN are set.'
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-12-13',
  token,
  useCdn: false,
});

// --- arg parsing ------------------------------------------------------------
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=')[1] : fallback;
};
const clean = args.includes('--clean');
const count = Number(getArg('count', '30'));
const authorUsername = getArg('user', process.env.ADMIN_ID);

const SAMPLE_CAPTIONS = [
  '오늘의 한 컷 📸',
  'Good vibes only ✨',
  '주말 나들이',
  'coffee & code ☕️',
  '노을이 예쁜 날',
  'Just another day',
  '맛집 발견!',
  'work in progress 🛠️',
  '산책하기 좋은 날씨',
  'throwback 🎞️',
];
const SAMPLE_COMMENTS = [
  '멋져요! 👍',
  'Love this',
  '와 대박',
  'nice shot',
  '여기 어디예요?',
  '최고 🔥',
  'so cool',
  '부럽다 ㅠㅠ',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

async function clearSeeded() {
  console.log('🧹 Removing previously seeded documents...');
  // Delete seeded posts first, then any seeded users (avoids dangling refs).
  const posts = await client.delete({ query: '*[_type == "post" && seeded == true]' });
  const users = await client.delete({ query: '*[_type == "user" && seeded == true]' });
  console.log(`   removed ${posts.results?.length ?? 0} posts, ${users.results?.length ?? 0} users.`);
}

async function getAuthor() {
  if (!authorUsername) {
    throw new Error('No author username. Set ADMIN_ID in .env.local or pass --user=<username>.');
  }
  const author = await client.fetch(`*[_type == "user" && username == $u][0]{_id, username}`, {
    u: authorUsername,
  });
  if (!author?._id) {
    throw new Error(
      `User "${authorUsername}" not found. Log in once to create the user doc, or pass an existing --user=<username>.`
    );
  }
  return author;
}

// Pool of users used as like/comment authors (falls back to the post author).
async function getUserPool(authorId) {
  const users = await client.fetch(`*[_type == "user"]{_id}`);
  const ids = users.map((u) => u._id);
  return ids.length > 0 ? ids : [authorId];
}

async function uploadImage(seed) {
  const url = `https://picsum.photos/seed/${seed}/800/800`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed (${res.status}) for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload('image', buffer, {
    filename: `seed-${seed}.jpg`,
    contentType: 'image/jpeg',
  });
  return asset._id;
}

async function createSeedPost(index, author, userPool) {
  const photoCount = Math.random() < 0.3 ? 2 : 1; // mostly single-image posts
  const photos = [];
  for (let p = 0; p < photoCount; p++) {
    const assetId = await uploadImage(`junsgram-${Date.now()}-${index}-${p}`);
    photos.push({
      _key: `photo_${index}_${p}_${Date.now()}`,
      _type: 'image',
      asset: { _type: 'reference', _ref: assetId },
    });
  }

  // First comment is the post caption (matches how the app creates posts).
  const comments = [
    {
      _key: `caption_${index}_${Date.now()}`,
      comment: pick(SAMPLE_CAPTIONS),
      author: { _type: 'reference', _ref: author._id },
    },
  ];
  const extraComments = Math.floor(Math.random() * 3);
  for (let c = 0; c < extraComments; c++) {
    comments.push({
      _key: `comment_${index}_${c}_${Date.now()}`,
      comment: pick(SAMPLE_COMMENTS),
      author: { _type: 'reference', _ref: pick(userPool) },
    });
  }

  const likers = sample(userPool, Math.floor(Math.random() * Math.min(userPool.length, 5)));
  const likes = likers.map((id, i) => ({
    _key: `like_${index}_${i}_${Date.now()}`,
    _type: 'reference',
    _ref: id,
  }));

  return client.create({
    _type: 'post',
    seeded: true,
    author: { _type: 'reference', _ref: author._id },
    photos,
    comments,
    likes,
  });
}

async function main() {
  if (clean) {
    await clearSeeded();
    return;
  }

  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Invalid --count: ${getArg('count', '30')}`);
  }

  const author = await getAuthor();
  const userPool = await getUserPool(author._id);
  console.log(`🌱 Seeding ${count} posts authored by "${author.username}"...`);

  for (let i = 0; i < count; i++) {
    await createSeedPost(i, author, userPool);
    process.stdout.write(`\r   created ${i + 1}/${count}`);
  }
  console.log(`\n✅ Done. Run \`npm run seed -- --clean\` to remove them.`);
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
