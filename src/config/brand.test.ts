import { describe, it, expect } from 'vitest';
import { brand } from './brand';

describe('Brand Config', () => {
  it('should have WATERLINE as brand name', () => {
    expect(brand.name).toBe('WATERLINE');
  });

  it('should have valid email addresses', () => {
    expect(brand.email.contact).toContain('@');
    expect(brand.email.leads).toContain('@');
    expect(brand.email.noreply).toContain('@');
  });

  it('should have valid domain', () => {
    expect(brand.domain).toBe('waterline.com');
  });
});
