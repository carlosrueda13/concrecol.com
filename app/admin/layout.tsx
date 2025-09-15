import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { AdminNav } from '@/components/admin/admin-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  
  if (!session && !pathname.includes('/admin/login')) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-y-0 z-50 flex w-72 flex-col bg-white">
        <div className="p-6">
          <span className="text-xl font-bold">Concrecol Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <AdminNav />
        </div>
      </div>
      <div className="pl-72">
        <header className="sticky top-0 z-40 border-b bg-white">
          <div className="container flex h-16 items-center justify-between py-4">
            <h1 className="text-lg font-semibold">
              {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace(/-/g, ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Admin'}
            </h1>
          </div>
        </header>
        <main className="container py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
