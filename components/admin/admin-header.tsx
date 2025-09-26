'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut,
  ListIcon,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Link>
      </Button>
      
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/productos">
          <Package className="w-4 h-4 mr-2" />
          Productos
        </Link>
      </Button>
      
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/categorias">
          <ListIcon className="w-4 h-4 mr-2" />
          Categorías
        </Link>
      </Button>
      
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/ordenes">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Pedidos
        </Link>
      </Button>
      
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/mensajes">
          <MessageSquare className="w-4 h-4 mr-2" />
          Mensajes
        </Link>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Salir
      </Button>
    </div>
  )
}
