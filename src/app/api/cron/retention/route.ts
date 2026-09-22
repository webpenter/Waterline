import { NextResponse, type NextRequest } from 'next/server';
import { runRetentionSweep } from '@/lib/privacy/anonymize';
import { verifyWebhookSignature } from '@/lib/security/webhooks';

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleRetention(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleRetention(request);
}

async function handleRetention(request: NextRequest): Promise<NextResponse> {
  // Validate CRON_SECRET if configured
  if (process.env.CRON_SECRET) {
    const isValid = verifyWebhookSignature(request, 'cron');
    if (!isValid) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const sweepResult = await runRetentionSweep();
    return NextResponse.json({ ok: true, data: sweepResult });
  } catch (err) {
    console.error('[retention-cron] sweep failed:', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Retention sweep failed' },
      { status: 500 },
    );
  }
}
