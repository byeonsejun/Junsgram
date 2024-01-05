import { RiSearchLine } from 'react-icons/ri';

type Props = {
  type?: string;
};

export default function SearchIcon({ type }: Props) {
  return (
    <RiSearchLine className={`w-6 h-6 text-white ${type && 'w-5 h-5 text-white/60 absolute top-[15px] left-[26px]'}`} />
  );
}
