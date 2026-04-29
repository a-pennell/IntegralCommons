'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requestMagicLink } from '@/server/auth';

const InputSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  next: z.string().regex(/^\//).optional(),
});

export async function requestMagicLinkAction(formData: FormData): Promise<void> {
  const parsed = InputSchema.safeParse({
    email: formData.get('email'),
    next: formData.get('next') || undefined,
  });

  if (!parsed.success) {
    redirect(`/login?error=invalid_email`);
  }

  const hdrs = await headers();
  const host = hdrs.get('host') ?? 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;
  const ipAddress = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim();

  const result = await requestMagicLink({
    email: parsed.data.email,
    baseUrl,
    ...(parsed.data.next !== undefined && { redirectTo: parsed.data.next }),
    ...(ipAddress !== undefined && { ipAddress }),
  });

  if (!result.ok) {
    const kind = result.error.kind === 'RateLimited' ? 'rate_limited' : 'dispatch_failed';
    redirect(`/login?error=${kind}`);
  }

  redirect(`/login?sent=${encodeURIComponent(parsed.data.email)}`);
}
