import { PrismaClient, UnitMeasure } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error('Admin credentials not found in environment variables')
  }

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: 'admin',
    },
  })

  // Create categories
  const categories = [
    { name: 'Concreto', slug: 'concreto' },
    { name: 'Cemento', slug: 'cemento' },
    { name: 'Pinturas', slug: 'pinturas' },
    { name: 'Agregados', slug: 'agregados' },
    { name: 'Preparados', slug: 'preparados' },
  ]

  for (const category of categories) {
    await prisma.sqlCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  // Create initial products
  const concreteCategory = await prisma.sqlCategory.findUnique({
    where: { slug: 'concreto' },
  })
  const cementCategory = await prisma.sqlCategory.findUnique({
    where: { slug: 'cemento' },
  })
  const paintCategory = await prisma.sqlCategory.findUnique({
    where: { slug: 'pinturas' },
  })
  const aggregatesCategory = await prisma.sqlCategory.findUnique({
    where: { slug: 'agregados' },
  })
  const preparedCategory = await prisma.sqlCategory.findUnique({
    where: { slug: 'preparados' },
  })

  if (!concreteCategory || !cementCategory || !paintCategory || !aggregatesCategory || !preparedCategory) {
    throw new Error('Categories not found')
  }

  const products = [
    {
      name: 'Concreto 21 MPa',
      slug: 'concreto-21-mpa',
      price_per_unit: 120000,
      unit_measure: UnitMeasure.M3,
      stock_quantity: 0,
      requires_scheduling: true,
      images: [],
      sqlCategoryId: concreteCategory.id,
    },
    {
      name: 'Cemento Portland',
      slug: 'cemento-portland',
      price_per_unit: 18000,
      unit_measure: UnitMeasure.BOLSA,
      stock_quantity: 500,
      requires_scheduling: false,
      images: [],
      sqlCategoryId: cementCategory.id,
    },
    {
      name: 'Pintura Vinílica',
      slug: 'pintura-vinilica',
      price_per_unit: 25000,
      unit_measure: UnitMeasure.GALON,
      stock_quantity: 50,
      requires_scheduling: false,
      images: [],
      sqlCategoryId: paintCategory.id,
    },
    {
      name: 'Agregado fino',
      slug: 'agregado-fino',
      price_per_unit: 35000,
      unit_measure: UnitMeasure.M3,
      stock_quantity: 100,
      requires_scheduling: false,
      images: [],
      sqlCategoryId: aggregatesCategory.id,
    },
    {
      name: 'Mortero preparado',
      slug: 'mortero-preparado',
      price_per_unit: 8000,
      unit_measure: UnitMeasure.BOLSA,
      stock_quantity: 200,
      requires_scheduling: false,
      images: [],
      sqlCategoryId: preparedCategory.id,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  console.log('Database has been seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
