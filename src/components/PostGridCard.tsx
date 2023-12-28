'use client';

import { SimplePost } from '@/model/post';
import Image from 'next/image';
import { useState } from 'react';
import ModalPortal from './ui/ModalPortal';
import PostModal from './PostModal';
import PostDetail from './PostDetail';
import { signIn, useSession } from 'next-auth/react';
import ImageSlide from './ui/ImageSlide';

type Props = {
  post: SimplePost;
  priority: boolean;
};
// user 상세 페이지에서 쓰이는 카드 컴포넌트
export default function PostGridCard({ post, priority }: Props) {
  const { image, username } = post;
  const [openModal, setOpenModal] = useState(false);
  const { data: session } = useSession();
  const handleOpenPost = () => {
    if (!session?.user) {
      return signIn();
    }
    setOpenModal(true);
  };
  return (
    <div className="relative w-full aspect-square">
      {/* 이미지의 url 배열중 첫번째만 보여줌 */}
      <Image
        className="object-cover"
        src={image[0]} //
        alt={`photo by ${username}`}
        fill
        sizes="650px"
        priority={priority}
        onClick={handleOpenPost}
      />
      {openModal && (
        <ModalPortal>
          <PostModal onClose={() => setOpenModal(false)}>
            {/* 유저 페이지에서 포스트 디테일 클릭시 보일 */}
            <PostDetail post={post} />
          </PostModal>
        </ModalPortal>
      )}
    </div>
  );
}
