import { NextRequest, NextResponse } from 'next/server';
import { addBookmark, removeBookmark } from '@/service/user';
import { withSessionUser } from '@/util/session';
import { badRequest, serverError } from '@/lib/http';
import { bookmarkSchema } from '@/lib/validation';

export async function PUT(req: NextRequest) {
  return withSessionUser(async (user) => {
    const parsed = bookmarkSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return badRequest();
    }
    const { id, bookmark } = parsed.data;

    const request = bookmark ? addBookmark : removeBookmark;

    return request(user.id, id) //
      .then((res) => NextResponse.json(res))
      .catch(serverError);
  });
}
