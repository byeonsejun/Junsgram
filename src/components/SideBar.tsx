import { AuthUser } from '@/model/user';
import Avatar from './Avatar';

type Props = {
  user: AuthUser;
};

const sideBarMenus: string[] = ['About', 'Help', 'Press', 'Api', 'Jobs', 'Privacy', 'Location', 'Language'];

export default function SideBar({ user: { name, username, image } }: Props) {
  return (
    <>
      <div className="flex items-center">
        {image && <Avatar image={image} size="large" highlight={false} />}
        <div className="ml-4">
          <p className="font-bold text-white/90">{username}</p>
          <p className="text-lg text-white/90 leading-4">{name}</p>
        </div>
      </div>
      <ul className="flex flex-wrap  mt-8 text-sm text-neutral-500">
        {sideBarMenus.map((munu, idx) => (
          <li key={munu}>
            <span className="cursor-pointer">{munu}</span>
            <span className="mx-1">{sideBarMenus.length !== idx + 1 && '·'}</span>
          </li>
        ))}
      </ul>
      <p className="font-bold text-sm mt-4 text-neutral-500 md:mt-8">@Copyright Junsgram from ByunSeJun</p>
    </>
  );
}
