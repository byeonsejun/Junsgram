import { HomeUser } from '@/model/user';
import { useCallback } from 'react';
import useSWR from 'swr';

async function updateBookmark(postId: string, bookmark: boolean) {
  return fetch('/api/bookmarks', {
    method: 'PUT',
    body: JSON.stringify({ id: postId, bookmark }),
  }).then((res) => res.json());
}

async function updateFollow(targetId: string, follow: boolean) {
  return fetch('/api/follow', {
    method: 'PUT',
    body: JSON.stringify({ id: targetId, follow }),
  }).then((res) => res.json());
}

export default function useMe() {
  const {
    data: user, //
    isLoading,
    error,
    mutate,
  } = useSWR<HomeUser>('/api/me');

  const setBookmark = useCallback(
    (postId: string, bookmark: boolean) => {
      if (!user) return;
      const bookmarks = user.bookmarks;
      const newUser = {
        ...user,
        // bookmark한다면 배열안에 postId 추가, 해제라면 bookmarks배열 중 [postId와 다른것만]
        bookmarks: bookmark ? [...bookmarks, postId] : bookmarks.filter((b) => b !== postId),
      };

      return mutate(updateBookmark(postId, bookmark), {
        // api fetch 반응이 오기 전 보여줄 ui data ( 왜냐하면 반응이 오고나서 ui 업데이트를 해준다면 ui변경이 느림 )
        optimisticData: newUser,
        populateCache: false, // api response로 반환된 값을 캐시에 덮어씌우지 않음 (왜냐하면 이미 클라쪽 값이 있기때문 )
        revalidate: false, // 이미 ui가 원하는 상태로 변경되었으니 백그라운드에서 다시 가져올 필요가 없음
        rollbackOnError: true, // update시 네트워크 문제 생기면 데이터 롤백 옵션
      });
    },
    [user, mutate]
  );

  const toggleFollow = useCallback(
    (targetId: string, follow: boolean) => {
      return mutate(updateFollow(targetId, follow), {
        populateCache: false,
      });
    },
    [mutate]
  );

  return { user, isLoading, error, setBookmark, toggleFollow };
}
