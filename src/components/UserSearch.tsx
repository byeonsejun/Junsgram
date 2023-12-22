'use client';

import { SearchUser } from '@/model/user';
import React, { FormEvent, useState } from 'react';
import useSWR from 'swr';
import GridSpinner from './ui/GridSpinner';
import UserCard from './UserCard';
import useDebounce from '@/hooks/debounce';

export default function UserSearch() {
  const [keywork, setKeyword] = useState('');
  const debouncedSearch = useDebounce(keywork);
  const { data: users, isLoading, error } = useSWR<SearchUser[]>(`/api/search/${debouncedSearch}`);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const regex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/'"\-=|]/;

    regex.test(e.target.value.charAt(0)) //
      ? setKeyword('')
      : setKeyword(e.target.value);
  };

  return (
    <section className="w-full max-w-2xl my-4 flex flex-col items-center">
      <form className="w-full mb-4" onSubmit={onSubmit}>
        <input //
          className="w-full text-xl p-3 outline-none border border-gray-400"
          type="text"
          autoFocus
          placeholder="Search for a username or name"
          value={keywork}
          onChange={onChange}
        />
      </form>
      {error && <p>유저의 정보를 가져오는데 실패하였습니다.</p>}
      {isLoading && <GridSpinner />}
      {!isLoading && !error && users?.length === 0 && <p>찾으시는 사용자가 없습니다.</p>}
      <ul className="w-full p-4">
        {users &&
          users.map((user) => (
            <li key={user.email}>
              <UserCard user={user} />
            </li>
          ))}
      </ul>
    </section>
  );
}