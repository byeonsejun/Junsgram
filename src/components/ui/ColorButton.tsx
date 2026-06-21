type Props = {
  text: string;
  onClick: () => void;
  size?: 'small' | 'big';
  type?: string;
};
export default function ColorButton({ text, onClick, size = 'small', type }: Props) {
  const isBig = size === 'big';
  return (
    <div
      className={`rounded-lg bg-gradient-to-bl from-fuchsia-600 via-rose-500 to-amber-300 p-[2px]
      ${type === 'nav' ? 'xl:absolute xl:bottom-[50px] xl:left-1/2 xl:-translate-x-1/2 xl:w-[150px]' : ''}
      ${type === 'sign' ? 'h-[38.5px]' : ''}`}
    >
      <button
        className={`w-full bg-white rounded-[6px] font-semibold text-neutral-900 transition-all duration-150 hover:opacity-90 active:scale-[0.98]
        ${isBig ? 'p-4 text-2xl' : 'px-4 py-[6px] text-base'}`}
        onClick={onClick}
      >
        {text}
      </button>
    </div>
  );
}
