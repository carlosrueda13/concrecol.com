import type { ColumnDef } from '@tanstack/react-table'
import type { OrderWithItems } from '@/types/prisma-extensions'

export type OrderColumns = ColumnDef<OrderWithItems>[]
