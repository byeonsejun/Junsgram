import { useCacheKeys } from '@/context/CacheKeysConttext';
import { Comment, SimplePost } from '@/model/post';
import { useCallback } from 'react';
import useSWR from 'swr';

async function updateLike(id: string, like: boolean) {
  return fetch('/api/likes', {
    method: 'PUT',
    body: JSON.stringify({ id, like }),
  }).then((res) => res.json());
}

async function addComment(id: string, comment: string) {
  return fetch('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ id, comment }),
  }).then((res) => res.json());
}

export default function usePosts() {
  const cacheKeys = useCacheKeys();
  const {
    data: posts, //
    isLoading,
    error,
    mutate,
  } = useSWR<SimplePost[]>(cacheKeys.postsKey);

  // console.log(posts);

  const setLike = useCallback(
    (post: SimplePost, username: string, like: boolean) => {
      // likes: // like눌렀다면 [기존배열 + 내이름] , 취소 눌렀다면 [배열에서 내이름 뺀거 리턴]
      const newPost = {
        ...post,
        likes: like ? [...post.likes, username] : post.likes.filter((item) => item !== username),
      };
      // 서버에서 받아온 posts정보들 => 서버포스트.id === 파람스포스트.id 같다면 ui변경된 포스트로!! 아니라면 기존 포스트
      const newPosts = posts?.map((p) => (p.id === post.id ? newPost : p));

      return mutate(updateLike(post.id, like), {
        // api fetch 반응이 오기 전 보여줄 ui data ( 왜냐하면 반응이 오고나서 ui 업데이트를 해준다면 ui변경이 느림 )
        optimisticData: newPosts,
        populateCache: false, // api response로 반환된 값을 캐시에 덮어씌우지 않음 (왜냐하면 이미 클라쪽 값이 있기때문 )
        revalidate: false, // 이미 ui가 원하는 상태로 변경되었으니 백그라운드에서 다시 가져올 필요가 없음
        rollbackOnError: true, // update시 네트워크 문제 생기면 데이터 롤백 옵션
      });
    },
    [posts, mutate]
  );

  const postComment = useCallback(
    (post: SimplePost, comment: Comment) => {
      const newPost = {
        ...post,
        comments: post.comments + 1,
      };
      // 서버에서 받아온 posts정보들 => 내가찾는 post라면 ui변경된 포스트로!! 아니라면 기존 포스트 그대로가져가는 배열 반환
      const newPosts = posts?.map((p) => (p.id === post.id ? newPost : p));

      return mutate(addComment(post.id, comment.comment), {
        // api fetch 반응이 오기 전 보여줄 ui data ( 왜냐하면 반응이 오고나서 ui 업데이트를 해준다면 ui변경이 느림 )
        optimisticData: newPosts,
        populateCache: false, // api response로 반환된 값을 캐시에 덮어씌우지 않음 (왜냐하면 이미 클라쪽 값이 있기때문 )
        revalidate: false, // 이미 ui가 원하는 상태로 변경되었으니 백그라운드에서 다시 가져올 필요가 없음
        rollbackOnError: true, // update시 네트워크 문제 생기면 데이터 롤백 옵션
      });
    },
    [posts, mutate]
  );

  return { posts, isLoading, error, setLike, postComment };
}
