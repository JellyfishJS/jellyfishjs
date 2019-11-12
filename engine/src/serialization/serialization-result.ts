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
 * Represents the type of property value,
 * if the property cannot be serialized directly.
 */
export enum SerializedObjectPropertyValueType {
    Reference = 'reference',
}

/**
 * References another object in the serialization.
 */
export interface SerializedObjectReference {
    type: SerializedObjectPropertyValueType.Reference;
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
