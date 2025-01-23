import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '@/lib/mongodb';
import { compare } from 'bcrypt';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const client = await clientPromise;
        const db = client.db('bentoit');
        const user = await db.collection('users').findOne({ 
          email: credentials.email 
        });

        if (!user) throw new Error('No user found');

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error('Invalid password');

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username, // Include username
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  }
});

export { handler as GET, handler as POST };