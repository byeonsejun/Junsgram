'use client';

import { ReactNode, useEffect } from 'react';
import CloseIcon from './ui/icons/CloseIcon';

type Props = {
  children: ReactNode;
  onClose: () => void;
};
export default function PostModal({ children, onClose }: Props) {
  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <section
      role="dialog"
      aria-modal="true"
      className="fixed top-0 left-0 flex flex-col justify-center items-center w-full h-full z-50 bg-neutral-900/90"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <button className="fixed top-0 right-0 text-white p-2 md:p-8" aria-label="닫기" onClick={() => onClose()}>
        <CloseIcon />
      </button>
      <div className="bg-black w-[90%] h-[85%] max-w-7xl md:w-[80%] md:h-3/5">{children}</div>
    </section>
  );
}
