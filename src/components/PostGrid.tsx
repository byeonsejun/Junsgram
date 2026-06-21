import GridSpinner from './ui/GridSpinner';
import PostGridCard from './PostGridCard';
import usePosts from '@/hooks/posts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

// user 상세 페이지에서 쓰이는 컴포넌트
export default function PostGrid() {
  const { posts, isLoading, isLoadingMore, isReachingEnd, loadMore } = usePosts();
  const sentinelRef = useInfiniteScroll(loadMore, !isReachingEnd);

  return (
    <div className="w-full text-center">
      {isLoading && <GridSpinner />}
      <ul className="grid grid-cols-3 gap-4 py-4 px-8">
        {posts &&
          posts.map((post, index) => (
            <li key={post.id}>
              <PostGridCard post={post} priority={index < 6} />
            </li>
          ))}
      </ul>
      {posts?.length === 0 && <h3 className="text-white text-center pb-8 md:mt-24">해당 게시물이 없습니다.</h3>}
      {/* 무한 스크롤 센티넬 */}
      {!isReachingEnd && <div ref={sentinelRef} aria-hidden className="h-1" />}
      {isLoadingMore && !isLoading && <GridSpinner />}
    </div>
  );
}
