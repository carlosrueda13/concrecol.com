import { Inter } from 'next/font/google'

export const metadata = {
  title: 'Admin Panel - Concrecol',
  description: 'Panel de administración para Concrecol',
  robots: 'noindex, nofollow'
}

const inter = Inter({ subsets: ['latin'] })

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className={inter.className}>
      {children}
    </div>
  )
}
