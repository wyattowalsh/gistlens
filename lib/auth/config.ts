import { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { sql } from '@vercel/postgres';

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'gist user:email',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && profile) {
        try {
          // Check if user exists
          const { rows: existingUsers } = await sql`
            SELECT * FROM users WHERE github_id = ${(profile as any).id} LIMIT 1;
          `;

          const githubProfile = profile as any;
          
          if (existingUsers.length === 0) {
            // Create new user
            await sql`
              INSERT INTO users (
                id, email, name, github_username, github_id, avatar_url, bio, public_gists
              ) VALUES (
                ${user.id}, ${user.email}, ${user.name}, 
                ${githubProfile.login}, ${githubProfile.id}, ${user.image}, 
                ${githubProfile.bio || null}, ${githubProfile.public_gists || 0}
              );
            `;

            // Create default settings
            await sql`
              INSERT INTO user_settings (user_id)
              VALUES (${user.id})
              ON CONFLICT (user_id) DO NOTHING;
            `;
          } else {
            // Update existing user
            await sql`
              UPDATE users 
              SET 
                email = ${user.email},
                name = ${user.name},
                avatar_url = ${user.image},
                bio = ${githubProfile.bio || null},
                public_gists = ${githubProfile.public_gists || 0},
                updated_at = CURRENT_TIMESTAMP
              WHERE github_id = ${githubProfile.id};
            `;
          }

          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      if (profile) {
        token.githubId = (profile as any).id;
        token.githubUsername = (profile as any).login;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).githubId = token.githubId;
        (session.user as any).githubUsername = token.githubUsername;
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
