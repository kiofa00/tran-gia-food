import { type NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '../../auth/[...nextauth]/route';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

async function proxyHandler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const targetPath = path.join('/');
  const targetUrl = new URL(targetPath, BACKEND_URL + '/');

  // Forward query string
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  // Get session server-side — no extra round-trip from client
  const session = await getServerSession(authOptions);

  const headers = new Headers();

  headers.set('Content-Type', 'application/json');
  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  let body: string | undefined;

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  const backendRes = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers();

  backendRes.headers.forEach((value, key) => {
    // Skip headers that Next.js manages
    if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const responseBody = await backendRes.text();

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
