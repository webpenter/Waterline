import { test, expect } from '@playwright/test';

test.describe('Health API', () => {
  test('returns the documented shape', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(typeof data.ok).toBe('boolean');
    expect(['connected', 'unreachable']).toContain(data.db);
    expect(['connected', 'unreachable']).toContain(data.search);
    expect(typeof data.version).toBe('string');
  });
});
