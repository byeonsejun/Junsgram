import NextAuth from 'next-auth';
import { addUser } from '@/service/user';
import { authConfig } from './auth.config';

// Full config (Node runtime): extends the edge-safe base with the Sanity-backed signIn callback.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Use the stable provider account id (Google `sub`) as the Sanity document
      // _id. Auth.js's `user.id` is a fresh random UUID per sign-in, which would
      // create a new duplicate user document on every login.
      const id = account?.providerAccountId;
      if (!user.email || !id) {
        return false;
      }
      // Upsert the user record, but don't block sign-in if it fails (e.g. a
      // transient Sanity error). For existing users this is a no-op upsert, so
      // a failure here must not lock them out — matches the pre-v5 behavior.
      try {
        await addUser({
          id,
          name: user.name ?? '',
          image: user.image ?? undefined,
          email: user.email,
          username: user.email.split('@')[0],
        });
      } catch (error) {
        console.error('[auth] addUser failed during signIn (continuing):', error);
      }
      return true;
    },
  },
});
