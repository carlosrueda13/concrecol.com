import { compare } from 'bcryptjs'
import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import CognitoProvider from 'next-auth/providers/cognito'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },

  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciales invalidas')
        }

        const user = await prisma.adminUser.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          throw new Error('Usuario no encontrado')
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        )

        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta')
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id
      }

      if (account?.provider === 'cognito') {
        token.role = 'admin'
      } else if (user && 'role' in user) {
        token.role = user.role
      }

      return token
    },

    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }

      return session
    },
  },
}
