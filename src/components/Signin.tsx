'use client';

import { ClientSafeProvider, signIn } from 'next-auth/react';
import LoginButton from './ui/LoginButton';

type Props = {
  providers: Record<string, ClientSafeProvider>;
  callbackUrl: string;
};

export default function Signin({ providers, callbackUrl }: Props) {
  return (
    <>
      {Object.values(providers).map(({ name, id }) => (
        <LoginButton
          type={`${name}`}
          text={`Sign in with ${name}`}
          onClick={() =>
            signIn(
              id,
              { callbackUrl }, //
              { loginHint: 'YOUR_GOOGLE_ID' }
              // { prompt: 'select_account' } // 로그인 창 새로띄우기
            )
          }
          key={id}
        />
      ))}
    </>
  );
}
