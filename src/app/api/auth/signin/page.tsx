import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getProviders } from 'next-auth/react';
import { Metadata } from 'next';
import Signin from '@/components/Signin';

export const metadata: Metadata = {
  title: 'Signin',
  description: 'Signup or Login to Junsgram',
};

type Props = {
  searchParams: {
    callbackUrl: string;
  };
};

export default async function SignInPage({ searchParams: { callbackUrl } }: Props) {
  const session = await getServerSession(authOptions);

  if (session) {
    // 세션이 있다면 (로그인을 했다면) 로그인을 할 필요가 없으므로 홈으로 보내주기
    // 만약 직접적인 url 입력 이나 로그인 링크를 다시 눌렀다면 홈으로 보내주기
    redirect('/');
  }

  const providers = (await getProviders()) ?? {};

  return (
    <section className="w-full flex justify-center mt-48 relative">
      <Signin providers={providers} callbackUrl={callbackUrl} />
    </section>
  );
}
