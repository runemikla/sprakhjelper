import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // HTTPS Enforcement (only in production)
  if (
    process.env.NODE_ENV === 'production' &&
    !request.headers.get('x-forwarded-proto')?.includes('https') &&
    !request.url.includes('localhost')
  ) {
    // Redirect HTTP to HTTPS
    const url = request.url.replace('http://', 'https://');
    return NextResponse.redirect(url, 301);
  }
  
  // CORS Configuration
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Add your production domain here
    // 'https://your-domain.com',
  ];
  
  // For local network access (e.g., 192.168.x.x), allow local IPs
  const isLocalNetwork = origin?.match(/^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+):\d+$/);
  
  if (origin && (allowedOrigins.includes(origin) || isLocalNetwork)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  // CORS headers for preflight requests
  if (request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 200 });
    preflightResponse.headers.set('Access-Control-Allow-Origin', origin || '*');
    preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    preflightResponse.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    return preflightResponse;
  }
  
  // Additional CORS headers
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

