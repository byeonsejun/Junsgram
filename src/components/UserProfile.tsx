import { ProfileUser } from '@/model/user';
import Avatar from './Avatar';
import FollowButton from './FollowButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type Props = {
  user: ProfileUser;
};
export default async function UserProfile({ user }: Props) {
  const session = await getServerSession(authOptions);
  const loginUser = session?.user;

  const { image, username, name, followers, following, posts } = user;

  const info = [
    { title: '게시물', data: posts },
    { title: '팔로워', data: followers },
    { title: '팔로우', data: following },
  ];
  return (
    <section className="w-full text-white flex flex-col md:flex-row items-center justify-center py-12 border-b border-white/30">
      <Avatar image={image} highlight size="xlarge" />
      <div className="md:ml-10 basis-1/3">
        <div className="flex flex-col items-center md:flex-row">
          <h1 className=" text-2xl font-bold md:mr-8 my-2 md:mb-0">{username}</h1>
          {loginUser && <FollowButton user={user} />}
        </div>
        <ul className="my-4 flex gap-6">
          {info.map(({ title, data }, index) => (
            <li key={title}>
              {title}
              <span className="font-bold ml-1">{data}</span>
            </li>
          ))}
        </ul>
        <p className="text-md text-center md:text-start">{name}</p>
      </div>
    </section>
  );
}
