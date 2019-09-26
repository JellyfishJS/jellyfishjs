/**
 * Takes undefined, a thing, or an array of things,
 * and returns an array containing any things passed to it.
 */
function asArray<T>(value: undefined | T | T[]): T[] {
    if (Array.isArray(value)) { return value; }
    if (value) { return [value]; }
    return [];
}
