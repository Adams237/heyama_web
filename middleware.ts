import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirige les requêtes API vers ton backend HTTP
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const url = request.nextUrl.clone();
    url.protocol = 'http:';
    url.hostname = '51.75.123.172';
    url.port = '5005';
    url.pathname = request.nextUrl.pathname.replace('/api/', '/');
    
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};