import { SearchUser } from '@/model/user';
import Link from 'next/link';
import Avatar from './Avatar';

type Props = {
  user: SearchUser;
};
export default function UserCard({ user: { name, username, image, following, followers } }: Props) {
  return (
    <Link href={`/user/${username}`} className="flex items-center w-full bg-black p-2 hover:bg-menu-bg">
      <Avatar image={image} />
      <div className="text-neutral-500 ml-2">
        <p className="text-white font-bold mb-[2px] leading-4">{username}</p>
        <p className="text-white/70">{name}</p>
        <p className="text-sm text-white/70 leading-4">{`${followers} followers • ${following} following`}</p>
      </div>
    </Link>
  );
}
