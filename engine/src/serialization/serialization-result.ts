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
 * Represents what kind of object a serialized object is.
 *
 * These potentially require different deserialization.
 */
export enum SerializedObjectType {

    /**
     * Indicates this serialized object is an object.
     */
    Object = 'object',

    /**
     * Indicates this serialized object is an array.
     */
    Array = 'array',

}

/**
 * The serialization of a single object.
 */
export interface SerializedObject {
    type: SerializedObjectType;
    stringKeyedProperties: {
        [key: string]: SerializedObjectPropertyValue;
    };
}

/**
 * Represents the type of property value,
 * if the property cannot be serialized directly.
 */
export enum SerializedObjectPropertyValueType {

    /**
     * Indicates this property value references another serialized object.
     */
    Reference = 'reference',

    /**
     * Indicates this property value is a big integer.
     */
    BigInt = 'bigint',

}

/**
 * References another object in the serialization.
 */
export interface SerializedObjectReference {
    type: SerializedObjectPropertyValueType.Reference;
    uuid: string;
}

/**
 * References another object in the serialization.
 */
export interface SerializedBigInt {
    type: SerializedObjectPropertyValueType.BigInt;
    value: string;
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
    | SerializedObjectReference
    | SerializedBigInt;
