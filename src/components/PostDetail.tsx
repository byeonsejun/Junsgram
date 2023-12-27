'use client';

import { SimplePost } from '@/model/post';
import Image from 'next/image';
import PostUserAvatar from './PostUserAvatar';
import ActionBar from './ActionBar';
import Avatar from './Avatar';
import useFullPost from '@/hooks/post';
import CloseIcon from './ui/icons/CloseIcon';
import useMe from '@/hooks/me';

type Props = {
  post: SimplePost;
};

const admin = process.env.NEXT_PUBLIC_ADMIN_ID || undefined;

export default function PostDetail({ post }: Props) {
  const { id, userImage, username, image } = post;
  const { post: data, postComment, deleteComment } = useFullPost(id);
  const { user } = useMe();

  const comments = data?.comments;

  const handleDelete = (currentKey: string | undefined) => {
    if (currentKey === undefined) return;
    if (window.confirm('comment를 삭제 하시겠습니까?')) {
      deleteComment(currentKey);
    }
  };

  // console.log(user); // 나에대한 정보
  // console.log(post); // 포스트 심플버전
  // console.log(data); // 디테일포스트 상세버전

  // console.log(admin);
  // console.log(user?.username === post?.username || user?.username === admin);

  return (
    <section className="flex w-full h-full flex-col md:flex-row ">
      <div className="relative h-[40%] p-4 md:h-auto md:basis-3/5">
        <Image
          className="object-contain md:object-cover p-2"
          src={image}
          alt={`photo by ${username}`}
          priority
          fill
          sizes="650px"
        />
      </div>

      <div className="w-full flex h-[60%] md:h-auto flex-col md:basis-2/5">
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
                  {/* 글작성자, 관리자, 댓글쓴사람 일시 삭제권한 부여 , 단 첫번째글은 삭제불가 */}
                  {index !== 0 &&
                    (user?.username === post?.username ||
                      user?.username === admin ||
                      user?.username === post.username) && (
                      <button
                        onClick={() => handleDelete(key)}
                        className="absolute right-0 top-[6.5px] md:right-[-20px]	"
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
