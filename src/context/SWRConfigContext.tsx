'use client';

import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';

type Props = {
  children: React.ReactNode;
};
export default function SWRConfigContext({ children }: Props) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetcher(url),
      }}
    >
      {children}
    </SWRConfig>
  );
}
