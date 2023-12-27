import { NextRequest, NextResponse } from 'next/server';
import { addComment, deleteComment } from '@/service/posts';
import { withSessionUser } from '@/util/session';

export async function POST(req: NextRequest) {
  return withSessionUser(async (user) => {
    const { id, comment } = await req.json();

    if (!id || comment == null) {
      return new Response('Bad Request', { status: 400 });
    }

    return addComment(id, user.id, comment) //
      .then((res) => NextResponse.json(res))
      .catch((error) => new Response(JSON.stringify(error), { status: 500 }));
  });
}

export async function PUT(req: NextRequest) {
  return withSessionUser(async () => {
    const { id, key } = await req.json();

    if (!id || key == null) {
      return new Response('Bad Request', { status: 400 });
    }

    return deleteComment(id, key) //
      .then((res) => NextResponse.json(res))
      .catch((error) => new Response(JSON.stringify(error), { status: 500 }));
  });
}
