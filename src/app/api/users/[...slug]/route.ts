import { NextRequest, NextResponse } from 'next/server';
import { getLikedOf, getPostsOf, getSavedPostsOf } from '@/service/posts';
import { parsePageParam } from '@/lib/pagination';
type Context = {
  params: Promise<{
    slug: string[]; // [ 'qustpwns93', 'posts' ]
  }>;
};
export async function GET(request_: NextRequest, context: Context) {
  const { slug } = await context.params;
  if (!slug || !Array.isArray(slug) || slug.length < 2) {
    return new NextResponse('Bad Request', { status: 400 });
  }
  const [username, query] = slug;
  const page = parsePageParam(request_.nextUrl.searchParams);

  let request = getPostsOf;
  if (query === 'saved') {
    request = getSavedPostsOf;
  } else if (query === 'liked') {
    request = getLikedOf;
  }

  return request(username, page).then((data) => NextResponse.json(data));
}
