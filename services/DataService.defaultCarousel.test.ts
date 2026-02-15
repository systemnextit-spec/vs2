import { describe, it, expect } from 'vitest';
import { DataService, DEFAULT_CAROUSEL_ITEMS } from './DataService';

describe('DataService default carousel items', () => {
  it('exposes the provided defaults in website config fallback', () => {
    const defaults = DataService.getDefaultWebsiteConfig();
    expect(defaults.carouselItems).toEqual(DEFAULT_CAROUSEL_ITEMS);
  });
});
