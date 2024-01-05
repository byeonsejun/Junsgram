import { FormEvent, useState } from 'react';
import SmileIcon from './ui/icons/SmileIcon';
type Props = {
  onPostComment: (comment: string) => void;
};
export default function CommentForm({ onPostComment }: Props) {
  const [comment, setComment] = useState('');
  const buttonDisabled = comment.length === 0;
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onPostComment(comment);
    setComment('');
  };
  return (
    <form onSubmit={handleSubmit} className="flex items-center mb-1">
      {/* <SmileIcon /> */}
      <input
        className="grow ml-2 border-none bg-black outline-none p-2 text-white"
        type="text"
        placeholder="댓글 달기..."
        required
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button //
        disabled={buttonDisabled}
        className={`w-[35px] font-bold mx-2 ${buttonDisabled ? 'text-sky-300/50' : 'text-sky-500'}`}
      >
        게시
      </button>
    </form>
  );
}
