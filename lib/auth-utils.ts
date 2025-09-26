import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { prisma } from '@/lib/prisma'

export async function requireAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Unauthorized - No session')
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: session.user.email as string },
  })

  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized - Invalid role')
  }

  return { session, admin }
}

export async function getOptionalAdminAuth() {
  try {
    return await requireAdminAuth()
  } catch {
    return null
  }
}