import UserPosts from '@/components/UserPosts';
import UserProfile from '@/components/UserProfile';
import { getUserForProfile } from '@/service/user';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Props = {
  params: Promise<{
    username: string;
  }>;
};

const getUser = cache(async (username: string) => getUserForProfile(username));

export default async function UserPage({ params }: Props) {
  const { username } = await params;
  const user = await getUser(username);

  if (!user?.name) {
    notFound();
  }

  return (
    <section className="w-full">
      <UserProfile user={user} />
      <UserPosts user={user} />
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);
  return {
    title: `${user?.name} (@${user?.username}) · Junsgram Photos`,
    description: `${user?.name}'s all Junsgram posts`,
  };
}
