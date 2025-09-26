import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import { CartItemWithProduct } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 5,
  },
  section: {
    marginTop: 20,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  col1: {
    width: '40%',
  },
  col2: {
    width: '20%',
    textAlign: 'center',
  },
  col3: {
    width: '20%',
    textAlign: 'right',
  },
  col4: {
    width: '20%',
    textAlign: 'right',
  },
  total: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
})

interface QuotePDFProps {
  items: CartItemWithProduct[]
  date: Date
  quoteNumber: string
}

export function QuotePDF({ items, date, quoteNumber }: QuotePDFProps) {
  const subtotal = items.reduce(
    (total, item) => total + item.product.price_per_unit * item.quantity,
    0
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Image
              src="/logo.png"
              style={styles.logo}
            />
            <View>
              <Text>Cotización #{quoteNumber}</Text>
              <Text>{date.toLocaleDateString()}</Text>
            </View>
          </View>
          <Text style={styles.title}>Cotización</Text>
          <Text style={styles.subtitle}>
            Construimos confianza, entregamos concreto
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Producto</Text>
              <Text style={styles.col2}>Cantidad</Text>
              <Text style={styles.col3}>Precio Unit.</Text>
              <Text style={styles.col4}>Total</Text>
            </View>
            {items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.col1}>{item.product.name}</Text>
                <Text style={styles.col2}>
                  {item.quantity} {item.product.unit_measure}
                </Text>
                <Text style={styles.col3}>
                  {formatPrice(item.product.price_per_unit)}
                </Text>
                <Text style={styles.col4}>
                  {formatPrice(item.product.price_per_unit * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>{formatPrice(subtotal)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            * Esta cotización es válida por 30 días.
          </Text>
          <Text style={styles.footerText}>
            * Los precios incluyen IVA.
          </Text>
          <Text style={styles.footerText}>
            * Los productos que requieren programación están sujetos a disponibilidad.
          </Text>
          <Text style={styles.footerText}>
            * El costo de envío se cotizará por separado según la ubicación.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
