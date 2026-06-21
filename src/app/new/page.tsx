import NewPost from '@/components/NewPost';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { API } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'New Post',
  description: 'create a new post',
};

export default async function NewPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(API.signin);
  }
  return (
    <>
      <NewPost user={session.user} />
    </>
  );
}
