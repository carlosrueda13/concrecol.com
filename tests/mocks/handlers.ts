import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/auth/callback/credentials', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'admin@concrecol.com',
        role: 'admin'
      }
    })
  }),

  http.get('/api/categories', () => {
    return HttpResponse.json([
      { id: '1', name: 'Concreto', slug: 'concreto' },
      { id: '2', name: 'Cemento', slug: 'cemento' }
    ])
  }),

  http.get('/api/products', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Concreto 21 MPa',
        slug: 'concreto-21-mpa',
        price_per_unit: 120000,
        unit_measure: 'M3',
        stock_quantity: 0,
        requires_scheduling: true,
        sqlCategory: { id: '1', name: 'Concreto', slug: 'concreto' }
      }
    ])
  })
]
