import NextAuth from 'next-auth';
import { authOptions } from '@/lib/server-auth-options';

// Debug logging for production environment issues
if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXTAUTH_SECRET) {
    console.error('❌ CRITICAL ERROR: NEXTAUTH_SECRET is not set in environment variables!');
  } else {
    console.log('✅ NEXTAUTH_SECRET is set.');
  }
  
  if (!process.env.NEXTAUTH_URL) {
    console.warn('⚠️ NEXTAUTH_URL is not set. NextAuth will try to infer it, but explicit setting is recommended.');
  } else {
    console.log('✅ NEXTAUTH_URL is set to:', process.env.NEXTAUTH_URL);
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
