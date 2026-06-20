import { NextRequest, NextResponse } from 'next/server';
import { follow, unfollow } from '@/service/user';
import { withSessionUser } from '@/util/session';
import { badRequest, serverError } from '@/lib/http';
import { followSchema } from '@/lib/validation';

export async function PUT(req: NextRequest) {
  return withSessionUser(async (user) => {
    const parsed = followSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return badRequest();
    }
    const { id: targetId, follow: isFollow } = parsed.data;

    const request = isFollow ? follow : unfollow;

    return request(user.id, targetId) //
      .then((res) => NextResponse.json(res))
      .catch(serverError);
  });
}
