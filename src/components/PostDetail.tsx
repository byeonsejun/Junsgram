import { SimplePost } from '@/model/post';
import Image from 'next/image';
import PostUserAvatar from './PostUserAvatar';
import ActionBar from './ActionBar';
import Avatar from './Avatar';
import useDetailPost from '@/hooks/post';
import CloseIcon from './ui/icons/CloseIcon';
import useMe from '@/hooks/me';
import ImageSlide from './ui/ImageSlide';
import { PropagateLoader } from 'react-spinners';
import MoreIcon from './ui/icons/MoreIcon';
import { useState } from 'react';
import GridSpinner from './ui/GridSpinner';
import { useRouter, usePathname } from 'next/navigation';
import usePosts from '@/hooks/posts';

type Props = {
  post: SimplePost;
};

const admin = process.env.NEXT_PUBLIC_ADMIN_ID || undefined;
//  포스트 상세 모달
export default function PostDetail({ post }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { id, userImage, username } = post;

  const { post: data, isLoading, postComment, deleteComment } = useDetailPost(id);
  const { deletePost } = usePosts();
  const { user } = useMe();

  const comments = data?.comments;

  const [showMore, setShowMore] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const handleCommentDelete = (currentKey: string | undefined) => {
    if (currentKey === undefined) return;
    if (window.confirm('comment를 삭제 하시겠습니까?')) {
      deleteComment(currentKey);
    }
  };

  const adminAuth = user?.username === admin; // 앱관리자라면 인증
  const postAuth = user?.username === post?.username; // 내가 쓴 포스트라면 인증

  const handlePostDelete = () => {
    if (!user) return;
    if (adminAuth || postAuth) {
      const postId = post.id;
      if (confirm('게시물을 정말 삭제하시겠습니까?')) {
        setShowLoading(true);

        deletePost(postId)
          ?.then(() => {
            if (pathname !== '/') {
              router.push('/');
            }
          })
          .catch((err) => {
            alert(`error = ${err} /n 포스트를 삭제하는데 실패하였습니다 다시 시도해 주세요.`);
          });
      }
    } else {
      alert('현재 게시글에 대한 삭제 권한이 없습니다.');
    }
  };

  if (showLoading) {
    return (
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%]	translate-y-[-50%]	 ">
        <GridSpinner />
      </div>
    );
  } else {
    return (
      <section
        className="flex w-full h-full flex-col md:flex-row "
        onClick={(e) => {
          const unTarget = document.getElementById('delete_btt');
          if (showMore && e.target !== unTarget) {
            setShowMore(false);
          }
        }}
      >
        {/* img 영역 */}
        <div className="relative h-[40%] p-4 md:h-auto md:w-[60%]">
          {isLoading ? (
            <PropagateLoader size={8} color="red" className="absolute top-[50%] left-[50%]" />
          ) : (
            <ImageSlide>
              {data &&
                data.image.map((img, index) => (
                  <div className="w-full h-full aspect-square relative" key={index}>
                    <Image
                      className="object-contain p-2"
                      src={img}
                      alt={`photo by ${data.username[index]}`}
                      priority
                      fill
                      sizes="650px"
                    />
                  </div>
                ))}
            </ImageSlide>
          )}
        </div>

        <div className="w-full flex h-[60%] flex-col md:h-auto md:w-[60%] relative">
          {(adminAuth || postAuth) && (
            <button className="absolute top-[10px] right-[10px] w-7 h-7" onClick={() => setShowMore(!showMore)}>
              <MoreIcon />
            </button>
          )}
          {showMore && (
            <div
              id="delete_btt"
              className="
            absolute z-[2] top-[50px] right-[5px] w-[150px] h-auto
            bg-white border-solid border-2 border-black/75
            "
            >
              <ul className="flex flex-col w-full h-full p-2">
                <li className="cursor-pointer text-center" onClick={handlePostDelete}>
                  게시물 삭제
                </li>
              </ul>
            </div>
          )}
          <PostUserAvatar image={userImage} username={username} />
          <ul className="border-t border-gray-200 h-full overflow-auto mb-1 p-[4px] md:p-2 md:pr-6">
            {comments &&
              comments.map(({ image, username: commentUsername, comment, key }, index) => (
                <li key={index} className="flex items-center mb-1 relative pr-[20px] md:pr-0">
                  <Avatar //
                    image={image}
                    size="small"
                    highlight={commentUsername === username}
                  />
                  <div className="ml-2 text-sm md:text-base">
                    <span className="font-bold mr-1">{commentUsername}</span>
                    <span>{comment}</span>
                    {/* 첫번째글은 삭제불가, 관리자, 글작성자, 댓글쓴사람 댓글삭제권한 부여 */}
                    {index !== 0 && (adminAuth || postAuth || user?.username === commentUsername) && (
                      <button
                        onClick={() => handleCommentDelete(key)}
                        className="absolute right-0 top-[6.5px] md:right-[-20px]"
                      >
                        <CloseIcon />
                      </button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
          <ActionBar post={post} onComment={postComment} />
        </div>
      </section>
    );
  }
}
