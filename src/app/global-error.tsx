'use client';

// Catches errors in the root layout itself; must render its own <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <div className="w-full flex flex-col items-center gap-4 py-24 text-center px-4">
          <h2 className="text-xl font-bold">문제가 발생했습니다.</h2>
          <button className="bg-blue-color rounded-md py-2 px-8 font-bold" onClick={() => reset()}>
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
