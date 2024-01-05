'use client';

import { ProfileUser } from '@/model/user';
import { useState } from 'react';
import PostIcon from './ui/icons/PostIcon';
import BookmarkIcon from './ui/icons/BookmarkIcon';
import HeartIcon from './ui/icons/HeartIcon';
import PostGrid from './PostGrid';
import { CaacheKeysContext } from '@/context/CacheKeysConttext';

type Props = {
  user: ProfileUser;
};

const tabs = [
  { name: '게시물', type: 'posts', title: 'User posts', icon: <PostIcon className="w-3 h-3" /> },
  { name: '저장됨', type: 'saved', title: 'Saved posts', icon: <BookmarkIcon className="w-3 h-3" /> },
  { name: '좋아함', type: 'liked', title: 'Liked posts', icon: <HeartIcon className="w-3 h-3" /> },
];

export default function UserPosts({ user: { username } }: Props) {
  const [query, setQuery] = useState(tabs[0].type);

  return (
    <section>
      <ul className="flex justify-center uppercase ">
        {tabs.map(({ type, icon, title, name }) => (
          <li
            key={type}
            className={`mx-12 p-4 cursor-pointer border-white
            ${type === query ? 'font-bold border-t text-white' : 'text-white/50'}`}
            onClick={() => setQuery(type)}
          >
            <button className="scale-150" aria-label={title}>
              {icon}
            </button>
            <span className="hidden md:inline md:ml-2">{name}</span>
          </li>
        ))}
      </ul>
      <CaacheKeysContext.Provider value={{ postsKey: `/api/users/${username}/${query}` }}>
        <PostGrid />
      </CaacheKeysContext.Provider>
    </section>
  );
}
