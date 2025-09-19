'use client'

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

const dummyData = [
  { name: "Concreto MR", value: 35 },
  { name: "Concreto 3000 PSI", value: 30 },
  { name: "Arena", value: 15 },
  { name: "Grava", value: 10 },
  { name: "Otros", value: 10 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function ProductsChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use dummy data for now, but in production this would fetch from an API
        // const response = await fetch('/api/admin/top-products')
        // const result = await response.json()
        setData(dummyData)
      } catch (error) {
        console.error("Error fetching product data:", error)
        setData(dummyData) // Fallback to dummy data on error
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="w-full">
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value}%`, "Participación"]}
          contentStyle={{ 
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
