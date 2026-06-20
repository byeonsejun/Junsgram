import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

// Edge-safe config (no Sanity / Node-only imports) so it can be used by middleware.
// The Sanity-dependent `signIn` callback lives in `src/auth.ts` (Node runtime only).
export const authConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_OAUTH_ID,
      clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    }),
  ],
  pages: {
    signIn: '/api/auth/signin',
  },
  callbacks: {
    jwt({ token, account }) {
      // Use the stable provider account id (Google `sub`) as our user id, NOT
      // Auth.js's per-sign-in random `user.id`. This keeps token.id aligned with
      // the Sanity user document `_id` (and avoids creating duplicate users).
      if (account?.providerAccountId) {
        token.id = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.username = session.user.email?.split('@')[0] ?? '';
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
