import { NextRequest, NextResponse } from 'next/server';
import { getBackendTargetUrl } from '@/helpers';

interface RouteParams {
  params: Promise<{
    path?: string[];
  }>;
}

async function handleProxyRequest(request: NextRequest, { params }: RouteParams) {
  try {
    const { path = [] } = await params;
    const targetUrl = getBackendTargetUrl(path, request.nextUrl.search);

    const forwardHeaders: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
      Accept: request.headers.get('accept') || 'application/json',
    };

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      forwardHeaders.Authorization = authHeader;
    }

    const refreshTokenHeader = request.headers.get('x-refresh-token');
    if (refreshTokenHeader) {
      forwardHeaders['x-refresh-token'] = refreshTokenHeader;
    }

    const cookieToken = request.cookies.get('token')?.value;
    if (!authHeader && cookieToken) {
      forwardHeaders.Authorization = `Bearer ${cookieToken}`;
    }

    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      try {
        body = await request.text();
      } catch {
        body = undefined;
      }
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: body && body.length > 0 ? body : undefined,
    });

    const responseText = await response.text();
    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText || 'No response body' };
    }

    return NextResponse.json(responseData, {
      status: response.status,
    });
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
