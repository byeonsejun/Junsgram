import NewPost from '@/components/NewPost';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'New Post',
  description: 'create a new post',
};

export default async function NewPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/api/auth/signin');
  }
  return (
    <>
      <NewPost user={session.user} />
    </>
  );
}
