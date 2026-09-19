import { NextRequest, NextResponse } from 'next/server';
import { getBackendTargetUrl } from '@/helpers';

interface RouteParams {
  params: Promise<{
    path?: string[];
  }>;
}

function extractForwardHeaders(request: NextRequest): Record<string, string> {
  const forwardHeaders: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
    Accept: request.headers.get('accept') || 'application/json',
  };

  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;

  if (authHeader) {
    forwardHeaders.Authorization = authHeader;
  } else if (cookieToken) {
    forwardHeaders.Authorization = `Bearer ${cookieToken}`;
  }

  const refreshTokenHeader = request.headers.get('x-refresh-token');
  if (refreshTokenHeader) {
    forwardHeaders['x-refresh-token'] = refreshTokenHeader;
  }

  return forwardHeaders;
}

async function extractRequestBody(request: NextRequest): Promise<string | undefined> {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    return undefined;
  }
  try {
    const text = await request.text();
    return text.length > 0 ? text : undefined;
  } catch {
    return undefined;
  }
}

function createProxyResponse(response: Response, responseText: string): NextResponse {
  const contentType = response.headers?.get
    ? response.headers.get('content-type') || 'application/json'
    : 'application/json';

  if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    const disposition = response.headers?.get ? response.headers.get('content-disposition') : null;
    if (disposition) {
      headers.set('Content-Disposition', disposition);
    }
    return new NextResponse(responseText, {
      status: response.status,
      headers,
    });
  }

  let responseData: unknown;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { message: responseText || 'No response body' };
  }

  return NextResponse.json(responseData, {
    status: response.status,
  });
}

async function handleProxyRequest(request: NextRequest, { params }: RouteParams) {
  try {
    const { path = [] } = await params;
    const targetUrl = getBackendTargetUrl(path, request.nextUrl.search);
    const forwardHeaders = extractForwardHeaders(request);
    const body = await extractRequestBody(request);

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
    });

    const responseText = await response.text();
    return createProxyResponse(response, responseText);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'BFF Proxy encountered an unexpected error';
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteParams) {
  return handleProxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteParams) {
  return handleProxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return handleProxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  return handleProxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return handleProxyRequest(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
