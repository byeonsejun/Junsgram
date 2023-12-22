import { NextRequest, NextResponse } from 'next/server';
import { getLikedOf, getPostsOf, getSavedPostsOf } from '@/service/posts';
type Context = {
  params: {
    slug: string[]; // [ 'qustpwns93', 'posts' ]
  };
};
export async function GET(_: NextRequest, context: Context) {
  const { slug } = context.params;
  if (!slug || !Array.isArray(slug) || slug.length < 2) {
    return new NextResponse('Bad Request', { status: 400 });
  }
  const [username, query] = slug;

  let request = getPostsOf;
  if (query === 'saved') {
    request = getSavedPostsOf;
  } else if (query === 'liked') {
    request = getLikedOf;
  }

  return request(username).then((data) => NextResponse.json(data));
}
