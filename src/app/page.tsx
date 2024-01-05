import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SideBar from '@/components/SideBar';
import PostList from '@/components/PostList';
import FollowingBar from '@/components/FollowingBar';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect('/api/auth/signin');
  }

  return (
    <section className="w-full max-w-[850px] flex flex-col md:flex-row p-4">
      <div className="w-full basis-3/4 min-w-0">
        <FollowingBar />
        <PostList />
      </div>
      <div className="px-4 md:px-0 md:basis-1/4 md:ml-8">
        <SideBar user={user} />
      </div>
    </section>
  );
}
