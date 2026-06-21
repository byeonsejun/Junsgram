import { useCacheKeys } from '@/context/CacheKeysContext';
import { Comment, SimplePost } from '@/model/post';
import { fetcher } from '@/lib/fetcher';
import { API } from '@/lib/routes';
import { POSTS_PAGE_SIZE } from '@/lib/pagination';
import { useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';

// Resolved values are discarded (mutate uses populateCache: false); typed as
// the paged shape only to satisfy SWR's mutate signature.
async function updateLike(id: string, like: boolean) {
  return fetcher<SimplePost[][]>(API.likes, {
    method: 'PUT',
    body: JSON.stringify({ id, like }),
  });
}

async function addComment(id: string, comment: string) {
  return fetcher<SimplePost[][]>(API.comments, {
    method: 'POST',
    body: JSON.stringify({ id, comment }),
  });
}

async function deleteTargetPost(postId: string) {
  return fetcher<SimplePost[][]>(API.posts, {
    method: 'DELETE',
    body: JSON.stringify({ postId }),
  });
}

export default function usePosts() {
  const cacheKeys = useCacheKeys();

  // 무한 스크롤: 페이지 인덱스별로 `?page=N`을 붙여 ranged 쿼리를 요청한다.
  // 이전 페이지가 비어 있으면 더 가져올 게 없으므로 키를 끊는다(null).
  const getKey = useCallback(
    (index: number, previousPageData: SimplePost[] | null) => {
      if (previousPageData && previousPageData.length === 0) return null;
      const base = cacheKeys.postsKey;
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}page=${index}`;
    },
    [cacheKeys.postsKey]
  );

  const {
    data: pages, //
    size,
    setSize,
    isLoading,
    error,
    mutate,
  } = useSWRInfinite<SimplePost[]>(getKey, {
    // 옵티미스틱 갱신이 잦으므로 mutate 때마다 1페이지를 재검증하지 않는다.
    revalidateFirstPage: false,
  });

  // 페이지 배열을 평탄화해 기존 소비처(렌더)가 그대로 단일 배열을 쓰게 한다.
  const posts = pages ? pages.flat() : undefined;
  const lastPage = pages?.[pages.length - 1];
  // 마지막 페이지가 한 페이지 분량보다 적으면 끝에 도달한 것.
  const isReachingEnd = !!pages && (lastPage?.length ?? 0) < POSTS_PAGE_SIZE;
  // 아직 로드되지 않은 다음 페이지를 기다리는 중인지.
  const isLoadingMore = isLoading || (size > 0 && !!pages && typeof pages[size - 1] === 'undefined');

  const loadMore = useCallback(() => {
    if (isLoadingMore || isReachingEnd) return;
    setSize((prev) => prev + 1);
  }, [isLoadingMore, isReachingEnd, setSize]);

  // 평탄화된 단일 post 변경을 모든 페이지에 매핑해 옵티미스틱 데이터를 만든다.
  const mapPages = useCallback(
    (transform: (post: SimplePost) => SimplePost | null) =>
      pages?.map((page) => page.map(transform).filter((p): p is SimplePost => p !== null)),
    [pages]
  );

  const setLike = useCallback(
    (post: SimplePost, username: string, like: boolean) => {
      // likes: like면 [기존배열 + 내이름], 취소면 [배열에서 내이름 뺀거]
      const newPages = mapPages((p) =>
        p.id === post.id
          ? { ...p, likes: like ? [...p.likes, username] : p.likes.filter((item) => item !== username) }
          : p
      );

      return mutate(updateLike(post.id, like), {
        // api fetch 반응이 오기 전 보여줄 ui data ( 반응 후 업데이트는 느리므로 )
        optimisticData: newPages,
        populateCache: false, // api response를 캐시에 덮어쓰지 않음 (이미 클라 값이 있음)
        revalidate: false, // 이미 원하는 상태이니 백그라운드 재요청 불필요
        rollbackOnError: true, // 네트워크 오류 시 롤백
      });
    },
    [mapPages, mutate]
  );

  const postComment = useCallback(
    (post: SimplePost, _comment: Comment) => {
      const newPages = mapPages((p) => (p.id === post.id ? { ...p, comments: p.comments + 1 } : p));

      return mutate(addComment(post.id, _comment.comment), {
        optimisticData: newPages,
        populateCache: false,
        revalidate: false,
        rollbackOnError: true,
      });
    },
    [mapPages, mutate]
  );

  const deletePost = useCallback(
    (postId: string) => {
      if (!postId) return;
      // 해당 post를 모든 페이지에서 제거(null 반환 → filter)
      const newPages = mapPages((p) => (p.id === postId ? null : p));

      return mutate(deleteTargetPost(postId), {
        optimisticData: newPages,
        populateCache: false,
        revalidate: false,
        rollbackOnError: true,
      });
    },
    [mapPages, mutate]
  );

  return {
    posts,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    loadMore,
    error,
    setLike,
    postComment,
    deletePost,
  };
}
