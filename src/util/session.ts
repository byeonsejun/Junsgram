import { auth } from '@/auth';
import { AuthUser } from '@/model/user';

export async function withSessionUser(
  // 전달받은 콜백 함수를 리턴함
  callbackFn: (user: AuthUser) => Promise<Response>
): Promise<Response> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return new Response('Authentication Error', { status: 401 });
  }

  return callbackFn(user);
}
