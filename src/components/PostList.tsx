'use client';

import { PropagateLoader } from 'react-spinners';
import PostListCard from './PostListCard';
import usePosts from '@/hooks/posts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function PostList() {
  const { posts, isLoading: loading, isLoadingMore, isReachingEnd, loadMore } = usePosts();
  const sentinelRef = useInfiniteScroll(loadMore, !isReachingEnd);

  return (
    <section>
      {loading && (
        <div className="text-center mt-32">
          <PropagateLoader size={8} color="red" />
        </div>
      )}
      {posts && (
        <ul>
          {posts.map((post, index) => (
            <li key={post.id} className="home_post_list mb-4">
              <PostListCard post={post} priority={index < 2} />
            </li>
          ))}
        </ul>
      )}
      {/* 무한 스크롤 센티넬: 화면에 들어오면 다음 페이지를 불러온다. */}
      {!isReachingEnd && <div ref={sentinelRef} aria-hidden className="h-1" />}
      {isLoadingMore && !loading && (
        <div className="text-center my-6">
          <PropagateLoader size={8} color="red" />
        </div>
      )}
    </section>
  );
}
