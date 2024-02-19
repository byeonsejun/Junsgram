import { FaGoogle } from 'react-icons/fa';

type Props = {
  onClick: () => void;
  type: string;
  text: string;
};

export default function LoginButton({ type, onClick, text }: Props) {
  return (
    <div
      className={`
      ${type === 'Google' && 'bg-gradient-to-l from-[#294fa8] to-[#60a3d6] text-2xl font-bold'}
      
    `}
    >
      <button
        className={`
    w-full py-4 px-4 gap-2  flex items-center sm:gap-4 md:gap-8 md:px-12
    `}
        onClick={onClick}
      >
        <FaGoogle className="w-6 h-6" />
        {text}
      </button>
    </div>
  );
}
