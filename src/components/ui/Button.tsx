type Props = {
  text: string;
  onClick: () => void;
  red?: boolean;
  disabled?: boolean;
};
export default function Button({ text, onClick, red, disabled = false }: Props) {
  return (
    <button
      className={`border-none rounded-lg py-2 px-8 text-white font-bold leading-4
      transition-all duration-150 active:scale-[0.97] disabled:active:scale-100
      ${red ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-color hover:bg-sky-600'} ${disabled && 'opacity-70 cursor-not-allowed'}
    `}
      onClick={() => onClick()}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
