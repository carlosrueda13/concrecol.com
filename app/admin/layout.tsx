import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Image from 'next/image'
import { authOptions } from '../api/auth/options'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminBodyClass } from '@/components/admin/admin-body-class'
import './admin.css'

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
      {/* This component will add the admin-page class to the body */}
      <AdminBodyClass />
      
      <div>
        <header className="sticky top-0 z-40 border-b bg-white admin-header">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center">
              <Image 
                src="/images/Property 1=Default-1.png" 
                alt="Concrecol Logo" 
                width={150} 
                height={40} 
                className="h-10 w-auto"
              />
            </div>
            <AdminHeader />
          </div>
        </header>
        <main className="container py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
