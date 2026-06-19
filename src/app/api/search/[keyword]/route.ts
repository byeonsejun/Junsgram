import { NextRequest, NextResponse } from 'next/server';
import { searchUsers } from '@/service/user';
type Context = {
  params: Promise<{ keyword: string }>;
};
export async function GET(_: NextRequest, context: Context) {
  const { keyword } = await context.params;
  return searchUsers(keyword).then((data) => NextResponse.json(data));
}
