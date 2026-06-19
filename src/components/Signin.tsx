'use client';

import { signIn } from 'next-auth/react';
import LoginButton from './ui/LoginButton';

export type AuthProvider = {
  id: string;
  name: string;
};

type Props = {
  providers: AuthProvider[];
  callbackUrl: string;
};

export default function Signin({ providers, callbackUrl }: Props) {
  return (
    <>
      {providers.map(({ name, id }) => (
        <LoginButton
          type={`${name}`}
          text={`Sign in with ${name}`}
          onClick={() => signIn(id, { callbackUrl })}
          key={id}
        />
      ))}
    </>
  );
}
