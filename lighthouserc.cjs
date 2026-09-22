module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 30000,
      // Prompt 16 acceptance: Lighthouse accessibility 100 on home, search
      // and listing (the sample listing exists via seed or demo fallback).
      url: [
        'http://localhost:3000/en',
        'http://localhost:3000/en/search',
        'http://localhost:3000/en/property/sample-wl-sample-001',
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1200 }],
        'total-byte-weight': ['warn', { maxNumericValue: 300000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
