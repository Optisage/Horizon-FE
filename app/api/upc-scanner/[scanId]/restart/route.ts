import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  context: { params: { scanId: string } }
) {
  try {
    const authCookie = req.cookies.get('optisage-token')?.value

    if (!authCookie) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { scanId } = context.params

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const response = await fetch(`${baseUrl}/upc-scanner/${scanId}/restart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authCookie}`,
        'Content-Type': 'application/json',
      },
    })

    const text = await response.text()
    if (!text.trim()) {
      return NextResponse.json(
        { status: 200, message: 'Scan restart initiated', data: null },
        { status: 200 }
      )
    }

    const data = JSON.parse(text)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error restarting UPC scan:', error)
    return NextResponse.json(
      { error: 'Failed to restart UPC scan' },
      { status: 500 }
    )
  }
}
