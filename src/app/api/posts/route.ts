import { NextRequest, NextResponse } from 'next/server';
import { createPost, getFollowingPostsOf } from '@/service/posts';
import { withSessionUser } from '@/util/session';

export async function GET() {
  return withSessionUser(async (user) =>
    getFollowingPostsOf(user.username) //
      .then((data) => NextResponse.json(data))
  );
}

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

    // console.log('api 서버 통신ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ');

    // if (text === 'sejun') {
    //   throw new Error('sejun 이라 테스트통신');
    //   // return new Response('Text Request', { status: 402 });
    // }

    if (!text || blobArray.length === 0) {
      return new Response('Bad Request', { status: 400 });
    }

    return createPost(user.id, text, blobArray) //
      .then((data) => NextResponse.json(data));
  });
}
