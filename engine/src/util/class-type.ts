/**
 * The type of the class itself.
 *
 * Unfortunately the `new () => T`
 * doesn't work with abstract classes.
 */
export interface Class<T> {
    prototype: T;
    name: string;
}
