import NextAuth from 'next-auth';
import { addUser } from '@/service/user';
import { authConfig } from './auth.config';

// Full config (Node runtime): extends the edge-safe base with the Sanity-backed signIn callback.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      await addUser({
        id: user.id!,
        name: user.name ?? '',
        image: user.image ?? undefined,
        email: user.email,
        username: user.email.split('@')[0],
      });
      return true;
    },
  },
});
