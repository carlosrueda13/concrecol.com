'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  ListIcon,
  BarChart,
  FileText
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    pattern: /^\/admin$/
  },
  {
    label: 'Pedidos',
    icon: ShoppingCart,
    href: '/admin/ordenes',
    pattern: /^\/admin\/ordenes/
  },
  {
    label: 'Productos',
    icon: Package,
    href: '/admin/productos',
    pattern: /^\/admin\/productos/
  },
  {
    label: 'Categorías',
    icon: ListIcon,
    href: '/admin/categorias',
    pattern: /^\/admin\/categorias/
  },
  {
    label: 'Clientes',
    icon: Users,
    href: '/admin/clientes',
    pattern: /^\/admin\/clientes/
  },
  {
    label: 'Reportes',
    icon: FileText,
    href: '/admin/reportes',
    pattern: /^\/admin\/reportes/
  },
  {
    label: 'Logs',
    icon: ListIcon,
    href: '/admin/logs',
    pattern: /^\/admin\/logs/
  },
  {
    label: 'Configuración',
    icon: Settings,
    href: '/admin/configuracion',
    pattern: /^\/admin\/configuracion/
  }
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-4">
      <div className="space-y-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-secondary',
              route.pattern.test(pathname) ? 'bg-secondary' : 'transparent'
            )}
          >
            <route.icon className="w-4 h-4" />
            {route.label}
          </Link>
        ))}
      </div>
      <div className="pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    </nav>
  )
}
