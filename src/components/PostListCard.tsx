'use client';

import { Comment, SimplePost } from '@/model/post';
import Image from 'next/image';
import ActionBar from './ActionBar';
import { useState } from 'react';
import PostModal from './PostModal';
import PostDetail from './PostDetail';
import PostUserAvatar from './PostUserAvatar';
import ModalPortal from './ui/ModalPortal';
import usePosts from '@/hooks/posts';
import ImageSlide from './ui/ImageSlide';

type Props = {
  post: SimplePost;
  priority?: boolean;
};

export default function PostListCard({ post, priority = false }: Props) {
  const { userImage, username, image, text, comments } = post;
  const [openModal, setOpenModal] = useState(false);
  const { postComment } = usePosts();
  const handlePostComment = (comment: Comment) => {
    postComment(post, comment);
  };

  return (
    <article className=" pb-2 border-b border-gray-200/50">
      <PostUserAvatar image={userImage} username={username} />
      <ImageSlide>
        {image &&
          image.map((img, idx) => (
            <Image
              key={`listCard_${idx}`}
              className="w-full object-cover aspect-square"
              src={img}
              alt={`photo by ${username}`}
              width={500}
              height={500}
              priority={priority}
              onClick={() => setOpenModal(true)}
            />
          ))}
      </ImageSlide>
      <ActionBar post={post} onComment={handlePostComment}>
        <p
          className="mb-1 text-white overflow-hidden text-ellipsis whitespace-nowrap
        "
        >
          <span className="font-bold text-white mr-1">{username}</span>
          {text}
        </p>
        {comments > 1 && (
          <button
            className="font-bold mb-1 text-sky-700 md:my-2 hover:text-blue-color"
            onClick={() => setOpenModal(true)}
          >{`댓글 ${comments}개 모두보기`}</button>
        )}
      </ActionBar>
      {openModal && (
        <ModalPortal>
          <PostModal onClose={() => setOpenModal(false)}>
            {/* 메인 페이지에서 포스트 디테일 클릭시 보일 */}
            <PostDetail post={post} />
          </PostModal>
        </ModalPortal>
      )}
    </article>
  );
}
