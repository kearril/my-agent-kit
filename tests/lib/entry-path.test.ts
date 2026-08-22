import { describe, expect, it } from 'vitest';
import { getEntryPath } from '../../src/lib/entry-path';

describe('entry path', () => {
  it('uses the immutable collection ID rather than a title or file name', () => {
    expect(getEntryPath({ id: 'building-a-long-lived-garden' })).toBe('/entries/building-a-long-lived-garden/');
  });
});
