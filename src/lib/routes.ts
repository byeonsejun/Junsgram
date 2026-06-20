// Centralized API/route paths to avoid scattered magic strings.
export const API = {
  posts: '/api/posts',
  post: (id: string) => `/api/posts/${id}`,
  me: '/api/me',
  likes: '/api/likes',
  comments: '/api/comments',
  bookmarks: '/api/bookmarks',
  follow: '/api/follow',
  signin: '/api/auth/signin',
} as const;
