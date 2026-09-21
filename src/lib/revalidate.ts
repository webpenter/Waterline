/**
 * Signed ISR revalidation, called from Payload afterChange hooks so edits
 * appear on the public site within seconds (spec §12 rule 5). The receiving
 * route handler (/api/revalidate) is built with the public pages; until then
 * the call 404s harmlessly. Never throws — a failed revalidation only delays
 * freshness until the ISR window expires.
 */
export async function revalidatePaths(paths: string[]): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!secret || !siteUrl || paths.length === 0) return;

  try {
    await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ paths }),
      signal: AbortSignal.timeout(4000),
    });
  } catch (err) {
    console.error('[revalidate] webhook failed (ISR window will refresh):', err);
  }
}
