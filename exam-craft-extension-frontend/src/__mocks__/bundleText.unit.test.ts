import value from './bundleText';

describe('default export', () => {
  it('should export an empty string', () => {
    expect(value).toBe('');
  });

  it('should be of type string', () => {
    expect(typeof value).toBe('string');
  });
});