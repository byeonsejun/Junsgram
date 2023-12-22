'use client';

import Link from 'next/link';
import { PropagateLoader } from 'react-spinners';
import Avatar from './Avatar';
import ScrollableBar from './ui/ScrollableBar';
import useMe from '@/hooks/me';

export default function FollowingBar() {
  const { user, isLoading } = useMe();
  const users = user?.following;

  return (
    <section className="w-full flex justify-center items-center p-4 shadow-sm shadow-neutral-300 mb-4 rounded-lg min-h-[90px] overflow-x-auto relative z-0">
      {isLoading ? (
        <PropagateLoader size={8} color="red" />
      ) : (
        (!users || users.length === 0) && <p>{`You don't have following`}</p>
      )}

      {users && users.length > 0 && (
        <ul className="w-full flex gap-2">
          <ScrollableBar>
            {users.map((user, idx) => (
              <Link key={idx} className="w-20 flex flex-col items-center" href={`/user/${user.username}`}>
                <Avatar image={user.image} highlight={true} />
                <p className="w-full text-center text-sm text-ellipsis overflow-hidden">{user.username}</p>
              </Link>
            ))}
          </ScrollableBar>
        </ul>
      )}
    </section>
  );
}
