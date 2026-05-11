import { type NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink, setSessionCookie } from '@/server/auth';

function getPublicOrigin(request: NextRequest): string {
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const origin = getPublicOrigin(request);
  const token = searchParams.get('token');
  const next = searchParams.get('next');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', origin));
  }

  const userAgent = request.headers.get('user-agent') ?? undefined;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  const result = await verifyMagicLink({
    plaintextToken: token,
    ...(userAgent !== undefined && { userAgent }),
    ...(ipAddress !== undefined && { ipAddress }),
  });

  if (!result.ok) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', origin));
  }

  await setSessionCookie(result.value.sessionId);

  const target = next && /^\//.test(next) ? next : '/spaces';
  return NextResponse.redirect(new URL(target, origin));
}
