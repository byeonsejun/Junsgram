import { SimplePost } from '@/model/post';
import { client, urlFor } from './sanity';
const simplePostProjection = `
  ...,
  "username": author->username,
  "userImage": author->image,
  "image": "",
  "likes": likes[]->username,
  "text": comments[0].comment,
  "comments": count(comments),
  "id":_id,
  "createdAt":_createdAt
`; // post.author.username -> post.username
// [ { asset: {_ref: 'image-400e9a09266fbca8b94ee9ca82900f41a88b2d45-18x34-png'}, _key: 'photo_0_1703674479864' }, { asset: {_ref: 'image-400e9a09266fbca8b94ee9ca82900f41a88b2d45-18x34-png'}, _key: 'photo_0_1703674479864' } ]

export async function getFollowingPostsOf(username: string) {
  return client
    .fetch(
      `
      *[_type == "post" && author->username == "${username}"
      || author._ref in *[_type == "user" && username == "${username}"].following[]._ref]
      | order(_createdAt desc){${simplePostProjection}}
    `
    )
    .then(mapPosts);
}

export async function getPost(id: string) {
  return client
    .fetch(
      `
    *[_type == "post" && _id == "${id}"][0]{
      ...,
      "username": author->username,
      "userImage": author->image,
      "image": "",
      "likes": likes[]->username,
      comments[]{
        "key":_key, 
        comment, 
        "username": author->username, 
        "image": author->image
      },
      "id":_id,
      "createdAt":_createdAt
    }
  `
    )
    .then((post) => ({ ...post, image: mapPost(post) }));
}
// ({ ...post, image: urlFor(post.image) })
export async function getPostsOf(username: string) {
  return client
    .fetch(
      `*[_type == "post" && author->username == "${username}"]
      | order(_createdAt desc){
        ${simplePostProjection}
      }
    `
    )
    .then(mapPosts);
}
export async function getLikedOf(username: string) {
  return client
    .fetch(
      `*[_type == "post" && "${username}" in likes[]->username]
      | order(_createdAt desc){
        ${simplePostProjection}
      }
    `
    )
    .then(mapPosts);
}
export async function getSavedPostsOf(username: string) {
  return client
    .fetch(
      `*[_type == "post" && _id in *[_type == "user" && username == "${username}"].bookmarks[]._ref]
      | order(_createdAt desc){
        ${simplePostProjection}
      }
    `
    )
    .then(mapPosts);
}

function mapPost(post: SimplePost) {
  const filterImg = post.photos.map((photo) => urlFor(photo.asset._ref));
  return filterImg;
}

function mapPosts(posts: SimplePost[]) {
  const filterImgArr = posts.map((post) => post.photos.map((item) => urlFor(item.asset._ref)));

  return posts.map((post: SimplePost, index) => ({
    ...post,
    likes: post.likes ?? [],
    image: filterImgArr[index],
  }));
}

export async function likePost(postId: string, userId: string) {
  return client
    .patch(postId) //
    .setIfMissing({ likes: [] })
    .append('likes', [
      {
        _ref: userId,
        _type: 'reference',
      },
    ])
    .commit({ autoGenerateArrayKeys: true });
}

export async function dislikePost(postId: string, userId: string) {
  return client
    .patch(postId)
    .unset([`likes[_ref=="${userId}"]`])
    .commit();
}

export async function addComment(postId: string, userId: string, comment: string) {
  return client
    .patch(postId) //
    .setIfMissing({ comments: [] })
    .append('comments', [
      {
        userId,
        comment,
        author: {
          _ref: userId,
          _type: 'reference',
        },
      },
    ])
    .commit({ autoGenerateArrayKeys: true });
}

export async function deleteComment(postId: string, key: string) {
  return client
    .patch(postId) //
    .unset([`comments[_key=="${key}"]`])
    .commit();
}

export async function createPost(userId: string, text: string, blobArray: Blob[]) {
  // console.log(blobArray);
  // console.log('새니티 통신');

  // Blob들을 저장할 배열
  const uploadPromises: Promise<string>[] = [];

  // Blob 배열의 각 Blob을 순회하면서 업로드 작업을 Promise 배열에 추가합니다.
  for (const blob of blobArray) {
    const uploadPromise = client.assets.upload('image', blob).then((result) => result._id);
    uploadPromises.push(uploadPromise);
  }

  // 업로드된 이미지 레퍼런스를 사용하여 Post를 생성합니다.
  // 모든 Blob 업로드 작업이 완료된 후에 실행됩니다.
  return Promise.all(uploadPromises).then((uploadedImageRefs) => {
    const photos = uploadedImageRefs.map((refId, index) => ({
      _key: `photo_${index}_${Date.now()}`, // 유니크한 키 추가
      asset: { _ref: refId },
    }));

    return client.create({
      _type: 'post',
      author: { _ref: userId },
      photos: photos,
      comments: [
        {
          _key: `comment_${Date.now()}`, // 유니크한 키 추가
          comment: text,
          author: { _ref: userId, _type: 'reference' },
        },
      ],
      likes: [],
    });
  });
}
