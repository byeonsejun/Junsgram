/* eslint-disable @next/next/no-img-element */
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
    <section
      className="
      relative w-full flex flex-col justify-center items-center px-8 md:flex-row md:mt-24 xl:mt-0
    "
    >
      <div className="w-full">
        <img src={`/assets/image/login.svg`} alt="login img" className="w-full" />
      </div>
      <div className="w-full text-white flex flex-col items-left gap-6">
        <h2 className="text-4xl font-bold">Welcom Junsgram</h2>
        <p className="text-[22px]">
          변세준의 인스타그램에 오신걸 환영합니다. <br />
          진행 가이드는 로그인을 진행하여 주신 뒤 검색 페이지에 들어가셔서 원하는 사람의 아이디를 팔로우 하시면 상대방의
          게시물이 홈 화면에 노출되는 방식으로 개발하였습니다. 게시물이 있는 qustpwns93의 아이디를 팔로우 해주시면
          확인하실수 있습니다.
        </p>
        <Signin providers={providers} callbackUrl={callbackUrl} />
      </div>
    </section>
  );
}
