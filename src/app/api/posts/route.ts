import { NextRequest, NextResponse } from 'next/server';
import { createPost, deletePost, getBookmarkOf, getFollowingPostsOf } from '@/service/posts';
import { withSessionUser } from '@/util/session';
import { removeBookmark } from '@/service/user';

type SampleItem = {
  filterInfo: Array<{ postIdValue: string; userIdValue: string }>;
};

export async function GET() {
  return withSessionUser(async (user) =>
    getFollowingPostsOf(user.username) //
      .then((data) => NextResponse.json(data))
  );
}

// 게시물 등록시 요청 api
export async function POST(req: NextRequest) {
  return withSessionUser(async (user) => {
    const form = await req.formData();
    const text = form.get('text')?.toString();
    const length = Number(form.get('length'));

    let blobArray: Blob[] = [];
    for (let i = 0; i < length; i++) {
      const blob = form.get(`number${i}`) as Blob;
      blobArray.push(blob);
    }

    if (!text || blobArray.length === 0) {
      return new Response('Bad Request', { status: 400 });
    }

    return createPost(user.id, text, blobArray) //
      .then((data) => NextResponse.json(data));
  });
}

// 게시물 삭제시 요청 api
export async function DELETE(req: NextRequest) {
  return withSessionUser(async () => {
    const { postId } = await req.json();

    const bookmarksArr = await getBookmarkOf(postId).then((bookmarksArr: SampleItem[]) => {
      return bookmarksArr.map((bookmark) => {
        return bookmark.filterInfo[0];
      });
    });

    const removeBookmarksArr = bookmarksArr.map((item) => {
      return removeBookmark(item.userIdValue, item.postIdValue);
    });

    await Promise.all(removeBookmarksArr);

    try {
      const data = await deletePost(postId);
      return NextResponse.json(data);
    } catch (error) {
      return new Response(JSON.stringify(error), { status: 500 });
    }
  });
}
