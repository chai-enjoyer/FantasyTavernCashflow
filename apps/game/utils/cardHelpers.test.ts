import { hideOptionParameters } from './cardHelpers';

describe('hideOptionParameters', () => {
  it('should remove (costs Xg) patterns', () => {
    expect(hideOptionParameters('Serve fresh ale (costs 20g)')).toBe('Serve fresh ale');
    expect(hideOptionParameters('Accept and prepare a lavish feast (costs 2000g)')).toBe('Accept and prepare a lavish feast');
    expect(hideOptionParameters('Buy supplies (costs 5000g)')).toBe('Buy supplies');
  });

  it('should remove (Xg per turn) patterns', () => {
    expect(hideOptionParameters('Accept the protection (100g per turn)')).toBe('Accept the protection');
    expect(hideOptionParameters('Pay rent (50g per turn)')).toBe('Pay rent');
  });

  it('should remove (free) patterns', () => {
    expect(hideOptionParameters('Take the free meal (free)')).toBe('Take the free meal');
  });

  it('should handle mixed case', () => {
    expect(hideOptionParameters('Buy item (Costs 100g)')).toBe('Buy item');
    expect(hideOptionParameters('Buy item (COSTS 100G)')).toBe('Buy item');
  });

  it('should not modify text without parameters', () => {
    expect(hideOptionParameters('Accept her offer gladly')).toBe('Accept her offer gladly');
    expect(hideOptionParameters('Refuse and stand your ground')).toBe('Refuse and stand your ground');
  });

  it('should handle multiple spaces', () => {
    expect(hideOptionParameters('Buy item  (costs  100g)')).toBe('Buy item');
  });
});