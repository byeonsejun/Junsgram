import { NextRequest, NextResponse } from 'next/server';
import { addComment, deleteComment, getCommentContext } from '@/service/posts';
import { isAdmin, withSessionUser } from '@/util/session';

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
  return withSessionUser(async (user) => {
    const { id, key } = await req.json();

    if (!id || key == null) {
      return new Response('Bad Request', { status: 400 });
    }

    // Authorization: the seed comment (index 0) is undeletable; otherwise only
    // an admin, the post author, or the comment author may delete a comment.
    const context = await getCommentContext(id, key);
    if (!context || !context.commentAuthorId) {
      return new Response('Not Found', { status: 404 });
    }
    if (key === context.firstCommentKey) {
      return new Response('Forbidden', { status: 403 });
    }
    const canDelete =
      isAdmin(user.username) || user.id === context.postAuthorId || user.id === context.commentAuthorId;
    if (!canDelete) {
      return new Response('Forbidden', { status: 403 });
    }

    return deleteComment(id, key) //
      .then((res) => NextResponse.json(res))
      .catch((error) => new Response(JSON.stringify(error), { status: 500 }));
  });
}
