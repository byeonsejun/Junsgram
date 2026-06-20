'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full flex flex-col items-center gap-4 text-white py-24 text-center px-4">
      <h2 className="text-xl font-bold">문제가 발생했습니다.</h2>
      <p className="text-white/70">잠시 후 다시 시도해 주세요.</p>
      <Button text="다시 시도" onClick={() => reset()} />
    </div>
  );
}
