import entities from './index';

describe('Entities Index', () => {
  it('should export an array', () => {
    expect(entities).toBeDefined();
    expect(Array.isArray(entities)).toBe(true);
    expect(entities.length).toBeGreaterThan(0);
  });
});
