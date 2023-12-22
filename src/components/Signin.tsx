'use client';

import { ClientSafeProvider, signIn } from 'next-auth/react';
import ColorButton from './ui/ColorButton';

type Props = {
  providers: Record<string, ClientSafeProvider>;
  callbackUrl: string;
};

export default function Signin({ providers, callbackUrl }: Props) {
  return (
    <>
      {Object.values(providers).map(({ name, id }) => (
        <ColorButton //
          key={id}
          text={`Sign In width ${name}`}
          onClick={() => signIn(id, { callbackUrl })}
          size="big"
        />
      ))}
    </>
  );
}
