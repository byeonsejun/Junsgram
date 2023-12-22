import { ReactNode } from 'react';
import CloseIcon from './ui/icons/CloseIcon';

type Props = {
  children: ReactNode;
  onClose: () => void;
};
export default function PostModal({ children, onClose }: Props) {
  return (
    <section
      className="fixed top-0 left-0 flex flex-col justify-center items-center w-full h-full z-50 bg-neutral-900/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          // 지금 누른 타겟과 현재의 타겟인 section과 같다면 닫아줌
          onClose();
        }
      }}
    >
      <button className="fixed top-0 right-0 p-8 text-white" onClick={() => onClose()}>
        <CloseIcon />
      </button>
      <div className="bg-white w-4/5 h-3/5 max-w-7xl">{children}</div>
    </section>
  );
}
