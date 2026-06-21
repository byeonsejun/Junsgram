import { NextRequest, NextResponse } from 'next/server';
import { dislikePost, likePost } from '@/service/posts';
import { withSessionUser } from '@/util/session';
import { badRequest, serverError } from '@/lib/http';
import { likeSchema } from '@/lib/validation';

export async function PUT(req: NextRequest) {
  return withSessionUser(async (user) => {
    const parsed = likeSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return badRequest();
    }
    const { id, like } = parsed.data;

    const request = like ? likePost : dislikePost;

    return request(id, user.id) //
      .then((res) => NextResponse.json(res))
      .catch(serverError);
  });
}
