'use client';

import { ProfileUser } from '@/model/user';
import Button from './ui/Button';
import useMe from '@/hooks/me';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from './ui/Spinner';

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
  const text = following ? '팔로우 취소' : '팔로우';

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
              <Spinner size="sm" />
            </div>
          )}
          <Button disabled={isUpdating} text={text} onClick={handleFollow} red={text === '팔로우 취소'} />
        </div>
      )}
    </>
  );
}
