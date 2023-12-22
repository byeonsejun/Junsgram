import { createContext, useContext } from 'react';

type CacheKeysValue = {
  postsKey: string;
};

export const CaacheKeysContext = createContext<CacheKeysValue>({
  postsKey: '/api/posts',
});

export const useCacheKeys = () => useContext(CaacheKeysContext);
