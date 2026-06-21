import { NextRequest, NextResponse } from 'next/server';
import { createPost, deletePost, getBookmarkOf, getFollowingPostsOf, getPostAuthorId } from '@/service/posts';
import { isAdmin, withSessionUser } from '@/util/session';
import { removeBookmark } from '@/service/user';
import { badRequest, forbidden, notFound, serverError } from '@/lib/http';
import { deletePostSchema } from '@/lib/validation';

type SampleItem = {
  filterInfo: Array<{ postIdValue: string; userIdValue: string }>;
};

const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB per image

export async function GET() {
  return withSessionUser(async (user) =>
    getFollowingPostsOf(user.username) //
      .then((data) => NextResponse.json(data))
      .catch(serverError)
  );
}

// 게시물 등록시 요청 api
export async function POST(req: NextRequest) {
  return withSessionUser(async (user) => {
    const form = await req.formData();
    const text = form.get('text')?.toString().trim();
    const length = Number(form.get('length'));

    if (!text || !Number.isInteger(length) || length < 1 || length > MAX_PHOTOS) {
      return badRequest();
    }

    const blobArray: Blob[] = [];
    for (let i = 0; i < length; i++) {
      const blob = form.get(`number${i}`);
      // Server-side upload validation: must be an image Blob within the size cap.
      if (!(blob instanceof Blob) || blob.size === 0 || blob.size > MAX_PHOTO_BYTES || !blob.type.startsWith('image/')) {
        return badRequest('Invalid file upload');
      }
      blobArray.push(blob);
    }

    return createPost(user.id, text, blobArray) //
      .then((data) => NextResponse.json(data))
      .catch(serverError);
  });
}

// 게시물 삭제시 요청 api
export async function DELETE(req: NextRequest) {
  return withSessionUser(async (user) => {
    const parsed = deletePostSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return badRequest();
    }
    const { postId } = parsed.data;

    // Authorization: only the post author or an admin may delete a post.
    const authorId = await getPostAuthorId(postId);
    if (!authorId) {
      return notFound();
    }
    if (authorId !== user.id && !isAdmin(user.username)) {
      return forbidden();
    }

    const bookmarksArr = await getBookmarkOf(postId).then((bookmarksArr: SampleItem[]) => {
      return bookmarksArr.map((bookmark) => {
        return bookmark.filterInfo[0];
      });
    });

    const removeBookmarksArr = bookmarksArr.map((item) => {
      return removeBookmark(item.userIdValue, item.postIdValue);
    });

    try {
      await Promise.all(removeBookmarksArr);
      const data = await deletePost(postId);
      return NextResponse.json(data);
    } catch (error) {
      return serverError(error);
    }
  });
}
