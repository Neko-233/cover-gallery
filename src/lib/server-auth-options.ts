import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user) {
            console.log('❌ Login failed: User not found for email:', credentials.email);
            return null;
          }
          
          if (!user.passwordHash) {
             console.log('❌ Login failed: User has no password hash');
             return null;
          }

          const ok = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!ok) {
            console.log('❌ Login failed: Password mismatch for user:', user.email);
            return null;
          }
          
          console.log('✅ Login successful for user:', user.email);
          return { id: user.id, name: user.name || '', email: user.email, image: user.image || undefined };
        } catch (e) {
          console.error('🔥 Auth error exception:', e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id;
        
        // Fetch fresh data from database to ensure session is always up-to-date
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const freshUser = await (prisma as any).user.findUnique({
                where: { id: token.id as string },
                select: { image: true, name: true }
            });
            
            if (freshUser) {
                session.user.image = freshUser.image;
                session.user.name = freshUser.name;
            }
        } catch (error) {
            console.error('Error fetching fresh session data:', error);
        }
      }
      return session;
    },
  },
};
