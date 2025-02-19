import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the token in cookies
  const token = request.cookies.get('token'); // Adjust the cookie name as needed

  // Define the paths that require authentication
  const protectedPaths = ['/dashboard', '/dashboard/settings', '/dashboard/subscriptions'];

  // Check if the request is for a protected path
  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    // If the token is not present, redirect to the login page
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url)); // Adjust the redirect path as needed
    }
  }

  // If the token exists or the path is not protected, allow the request to proceed
  return NextResponse.next();
}

// Specify the paths where the middleware should run
export const config = {
  matcher: ['/dashboard/:path*', '/dashboard/settings', '/dashboard/subscriptions'],
}; 