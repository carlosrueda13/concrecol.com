'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const dummyData = [
  { name: "Ene", ventas: 400000 },
  { name: "Feb", ventas: 600000 },
  { name: "Mar", ventas: 550000 },
  { name: "Abr", ventas: 780000 },
  { name: "May", ventas: 900000 },
  { name: "Jun", ventas: 820000 },
  { name: "Jul", ventas: 950000 },
  { name: "Ago", ventas: 1050000 },
  { name: "Sep", ventas: 1200000 },
]

interface SalesChartProps {
  extended?: boolean
}

export function SalesChart({ extended = false }: SalesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use dummy data for now, but in production this would fetch from an API
        // const response = await fetch('/api/admin/sales-analytics')
        // const result = await response.json()
        setData(dummyData)
      } catch (error) {
        console.error("Error fetching sales data:", error)
        setData(dummyData) // Fallback to dummy data on error
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <div className="w-full">
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={extended ? 400 : 300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tickLine={false}
          axisLine={false}
          tickCount={5}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), "Ventas"]}
          contentStyle={{ 
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }}
        />
        <Legend />
        <Bar 
          dataKey="ventas" 
          name="Ventas" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]}
          barSize={extended ? 40 : 20}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
