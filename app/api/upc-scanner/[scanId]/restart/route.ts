import { NextRequest, NextResponse } from 'next/server';
import { ScanResult } from '@/app/(dashboard)/upc-scanner/_components/UpcScanner';

export async function POST(
  req: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    // Get auth token from cookies
    const authCookie = req.cookies.get('optisage-token')?.value;

    if (!authCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { scanId } = params;
    
    // Forward the request to the backend API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    const response = await fetch(`${baseUrl}/upc-scanner/${scanId}/restart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authCookie}`,
        'Content-Type': 'application/json',
      },
    });

    // Get the response data
    const data = await response.json();

    // Return the API response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error restarting UPC scan:', error);
    return NextResponse.json(
      { error: 'Failed to restart UPC scan' },
      { status: 500 }
    );
  }
}