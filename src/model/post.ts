export type Comment = {
  comment: string;
  username: string;
  image?: string | undefined;
};

export type GetComment = Comment & {
  key?: string;
};

export type SimplePost = Omit<FullPost, 'comments'> & {
  comments: number;
};

export type FullPost = {
  id: string;
  username: string;
  userImage: string;
  image: string[];
  photos: SanityImage[];
  text: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
};

export type SanityImage = {
  asset: {
    _ref: string;
  };
  _key: string;
};

export type GetFullPost = {
  id: string;
  username: string;
  userImage: string;
  image: string[];
  text: string;
  createdAt: string;
  likes: string[];
  comments: GetComment[];
};
