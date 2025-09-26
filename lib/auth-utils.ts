import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/options'
import { safeQuery } from '@/lib/db-wrapper'

export async function requireAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error('Unauthorized - No session')
  }

  const admin = await safeQuery(async (prisma) => {
    return await prisma.adminUser.findUnique({
      where: { email: session.user.email as string },
    })
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