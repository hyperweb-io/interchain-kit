/**
 * Checks if the given class (ctor) is the same as or extends the target class (targetCtor).
 * @param ctor The class to test.
 * @param targetCtor The target class to match against.
 * @returns True if ctor is the same as or extends targetCtor, false otherwise.
 */
export function isSameConstructor(
  ctor: Function,
  targetCtor: Function
): boolean {
  if (ctor === targetCtor) return true;
  let proto = Object.getPrototypeOf(ctor);
  while (proto && proto !== Function.prototype) {
    if (proto === targetCtor) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}