import { createContext, useContext } from 'react';
import { API } from '@/lib/routes';

type CacheKeysValue = {
  postsKey: string;
};

export const CacheKeysContext = createContext<CacheKeysValue>({
  postsKey: API.posts,
});

export const useCacheKeys = () => useContext(CacheKeysContext);
