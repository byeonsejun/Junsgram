import { NextRequest, NextResponse } from 'next/server';
import { addComment, deleteComment, getCommentContext } from '@/service/posts';
import { isAdmin, withSessionUser } from '@/util/session';
import { badRequest, forbidden, notFound, serverError } from '@/lib/http';
import { addCommentSchema, deleteCommentSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  return withSessionUser(async (user) => {
    const parsed = addCommentSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return badRequest();
    }
    const { id, comment } = parsed.data;

    return addComment(id, user.id, comment) //
      .then((res) => NextResponse.json(res))
      .catch(serverError);
  });
}

export async function PUT(req: NextRequest) {
  return withSessionUser(async (user) => {
    const parsed = deleteCommentSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return badRequest();
    }
    const { id, key } = parsed.data;

    // Authorization: the seed comment (index 0) is undeletable; otherwise only
    // an admin, the post author, or the comment author may delete a comment.
    const context = await getCommentContext(id, key);
    if (!context || !context.commentAuthorId) {
      return notFound();
    }
    if (key === context.firstCommentKey) {
      return forbidden();
    }
    const canDelete =
      isAdmin(user.username) || user.id === context.postAuthorId || user.id === context.commentAuthorId;
    if (!canDelete) {
      return forbidden();
    }

    return deleteComment(id, key) //
      .then((res) => NextResponse.json(res))
      .catch(serverError);
  });
}
