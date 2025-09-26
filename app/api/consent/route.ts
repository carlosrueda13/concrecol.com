import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'

const consentSchema = z.object({
  necessary: z.boolean().default(true),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const consent = consentSchema.parse(body)
    
    // Store consent in cookie
    cookies().set('user-consent', JSON.stringify(consent), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/'
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid consent data' },
      { status: 400 }
    )
  }
}

export async function GET() {
  const consentCookie = cookies().get('user-consent')
  
  if (!consentCookie) {
    return NextResponse.json({
      necessary: true,
      analytics: false,
      marketing: false
    })
  }
  
  return NextResponse.json(JSON.parse(consentCookie.value))
}