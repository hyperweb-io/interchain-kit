import { isSameConstructor } from '../../src/utils/is-same-constructor';

describe('isSameConstructor', () => {
  class A { }
  class B extends A { }
  class C { }

  it('returns true for same constructor', () => {
    expect(isSameConstructor(A, A)).toBe(true);
  });

  it('returns true for subclass', () => {
    expect(isSameConstructor(B, A)).toBe(true);
  });

  it('returns false for unrelated classes', () => {
    expect(isSameConstructor(C, A)).toBe(false);
  });
}); 