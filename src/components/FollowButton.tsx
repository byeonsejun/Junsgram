'use client';

import { ProfileUser } from '@/model/user';
import CommonButton from './ui/CommonButton';
import useMe from '@/hooks/me';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PulseLoader } from 'react-spinners';

type Props = {
  user: ProfileUser;
};
export default function FollowButton({ user }: Props) {
  const { username } = user; // 페이지유저의 대한 정보
  const { user: loggedInUser, toggleFollow } = useMe(); // 나에대한 정보

  const router = useRouter();
  const [isPendig, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const isUpdating = isPendig || isFetching;

  const showButton = loggedInUser && loggedInUser.username !== username;
  const following = loggedInUser && loggedInUser.following.find((following) => following.username === username);
  const text = following ? 'Unfollow' : 'Follow';

  const handleFollow = async () => {
    setIsFetching(true);
    await toggleFollow(user.id, !following);
    setIsFetching(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      {showButton && (
        <div className="relative">
          {isUpdating && (
            <div className="absolute z-20 inset-0 flex justify-center items-center">
              <PulseLoader size={6} />
            </div>
          )}
          <CommonButton disabled={isUpdating} text={text} onClick={handleFollow} red={text === 'Unfollow'} />
        </div>
      )}
    </>
  );
}
