import Avatar from './Avatar';
type Props = {
  image: string;
  username: string;
  type?: string;
};
export default function PostUserAvatar({ image, username }: Props) {
  return (
    <div className="flex items-center p-2">
      <Avatar image={image} size="small" highlight />
      <span className="text-white font-bold ml-2">{username}</span>
    </div>
  );
}
