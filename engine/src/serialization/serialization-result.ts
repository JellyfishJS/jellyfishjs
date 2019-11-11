/**
 * Any object that can be serialized.
 */
export interface SerializableObject {
    [key: string]: unknown;
}

/**
 * A serialization of some object.
 *
 * Compatible with JSON.
 */
export interface SerializationResult {
    rootObject: string;
    objects: {
        [uuid: string]: SerializedObject,
    };
}

/**
 * The serialization of a single object.
 */
export interface SerializedObject {
    stringKeyedProperties: {
        [key: string]: SerializedObjectPropertyValue;
    };
}

/**
 * References another object in the serialization.
 */
export interface SerializedObjectReference {
    type: 'reference';
    uuid: string;
}

/**
 * A value on a serialized object.
 */
export type SerializedObjectPropertyValue =
    | number
    | bigint
    | string
    | boolean
    | null
    | undefined
    | SerializedObjectPropertyValue[]
    | SerializedObjectReference;
