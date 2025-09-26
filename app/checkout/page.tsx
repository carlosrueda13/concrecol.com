import { redirect } from 'next/navigation'
import { CartItemWithProduct } from '@/lib/types'
import { CheckoutForm } from '@/components/checkout-form'
import { getServerCart } from '@/lib/server-cart'

export default async function CheckoutPage() {
  const cartItems = await getServerCart()

  if (cartItems.length === 0) {
    redirect('/carrito')
  }

  const hasScheduledProduct = cartItems.some(
    (item: CartItemWithProduct) => item.product.requires_scheduling
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground mt-2">
              Complete los datos para finalizar tu compra
            </p>
          </div>

          <CheckoutForm
            hasScheduledProduct={hasScheduledProduct}
          />
        </div>
      </div>
    </div>
  )
}
