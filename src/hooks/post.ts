import { Comment, FullPost, GetComment, GetFullPost } from '@/model/post';
import { useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';

async function addComment(id: string, comment: string) {
  return fetch('/api/comments', {
    method: 'POST',
    body: JSON.stringify({ id, comment }),
  }).then((res) => res.json());
}

async function removeComment(id: string, key: string) {
  return fetch('/api/comments', {
    method: 'PUT',
    body: JSON.stringify({ id, key }),
  }).then((res) => res.json());
}

export default function useDetailPost(postId: string) {
  const { data: post, isLoading, error, mutate } = useSWR<GetFullPost>(`/api/posts/${postId}`);

  const { mutate: globalMutate } = useSWRConfig();

  // console.log(post); // 풀 포스트 = 한개의 대한 모든 디테일 포스트정보

  const postComment = useCallback(
    (comment: Comment) => {
      if (!post) return;
      const newPost = {
        ...post,
        comments: [...post.comments, comment],
      };

      return mutate(addComment(post.id, comment.comment), {
        // api fetch 반응이 오기 전 보여줄 ui data ( 왜냐하면 반응이 오고나서 ui 업데이트를 해준다면 ui변경이 느림 )
        optimisticData: newPost,
        populateCache: false, // api response로 반환된 값을 캐시에 덮어씌우지 않음 (왜냐하면 이미 클라쪽 값이 있기때문 )
        revalidate: true, // true 시 == _key값이 새니티상에서 생성되고 다시 가져와야하기때문에 // false 시 == 이미 ui가 원하는 상태로 변경되었으니 백그라운드에서 다시 가져올 필요가 없음
        rollbackOnError: true, // update시 네트워크 문제 생기면 데이터 롤백 옵션
      }).then(() => globalMutate('/api/posts'));
    },
    [post, mutate, globalMutate]
  );

  const deleteComment = useCallback(
    (key: string) => {
      if (!post) return;

      const removePost = post?.comments.filter((p) => p.key !== key);

      const newPost = {
        ...post,
        comments: removePost,
      };

      return mutate(removeComment(post.id, key), {
        optimisticData: newPost,
        populateCache: false,
        revalidate: false,
        rollbackOnError: true,
      }).then(() => globalMutate('/api/posts'));
    },
    [post, mutate, globalMutate]
  );

  return { post, isLoading, error, postComment, deleteComment };
}
