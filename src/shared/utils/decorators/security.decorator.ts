/**
 * Freeze a class, ot make changing impossible
 * - No methods or propertiy can by add, delete or update
 * 
 * @param constructor - is the constructor of the class to freeze
 */
export function Frozen(constructor: Function) {
    // Freeze the class (static method)
    Object.freeze(constructor);
    // Freeze prototype (instence method)
    Object.freeze(constructor.prototype);
  }