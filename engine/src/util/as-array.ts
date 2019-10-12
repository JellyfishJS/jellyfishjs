/**
 * An array of `T`, a single `T`, or `undefined`.
 */
export type AnyAmountOf<T> = undefined | T | readonly T[];

/**
 * Takes `undefined`, a `T`, or an array of `T`,
 * and returns an array containing any `T` passed to it.
 */
export function asArray<T>(value: AnyAmountOf<T>): readonly T[] {
    if (Array.isArray(value)) { return value; }
    if (value) { return [value as T]; }
    return [];
}
