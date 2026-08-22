import { describe, expect, it } from 'vitest';
import { getEntryPath } from '../../src/lib/entry-path';

describe('entry path', () => {
  it('formats canonical entry path from immutable slug', () => {
    expect(getEntryPath({ id: 'building-a-long-lived-garden' })).toBe('/entries/building-a-long-lived-garden/');
  });
});
