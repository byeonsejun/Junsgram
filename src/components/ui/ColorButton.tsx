type Props = {
  text: string;
  onClick: () => void;
  size?: 'small' | 'big';
  type?: string;
};
export default function ColorButton({ text, onClick, size = 'small', type }: Props) {
  return (
    <div
      className={`rounded-md bg-gradient-to-bl from-fuchsia-600 via-rose-500 to-amber-300 p-[0.15rem]
    ${size === 'big' ? 'p[0.3rem]' : 'p-[0.15rem'}
    ${type === 'nav' && 'xl:absolute xl:bottom-[50px] xl:left-[50%] xl:translate-x-[-50%] xl:w-[150px]'}
    ${type === 'sign' && 'h-[38.5px]'}
    `}
    >
      <button
        className={`bg-white rounded-sm text-base p-[0.3rem] hover:opacity-90 transition-opacity 
    ${size === 'big' ? 'p-4 text-2xl' : 'p-[0.3rem text-base'} 
    ${type === 'nav' && 'xl: w-full xl:rounded-[5px]'}
    `}
        onClick={onClick}
      >
        {text}
      </button>
    </div>
  );
}
