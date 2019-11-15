/**
 * Any entity that can be serialized.
 */
export interface SerializableEntity {
    [key: string]: unknown;
}

/**
 * Some entity that has been serialized.
 *
 * Compatible with JSON.
 */
export interface SerializedEntity {
    rootItem: string;
    items: {
        [uuid: string]: SerializedItem,
    };
}

/**
 * Represents what kind of object a serialized object is.
 *
 * These potentially require different deserialization.
 */
export enum SerializedItemMetadataType {

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
 * Metadata describing an serialized item that is an object.
 */
export interface SerializedItemObjectMetadata {
    type: SerializedItemMetadataType.Object;
}

/**
 * Metadata describing an serialized item that is an array.
 */
export interface SerializedItemArrayMetadata {
    type: SerializedItemMetadataType.Array;
}

/**
 * Information describing a serialized item.
 *
 * Different kinds of items need to be deserialized differently.
 */
export type SerializedItemMetadata =
    | SerializedItemObjectMetadata
    | SerializedItemArrayMetadata;

/**
 * The serialization of a single object.
 */
export interface SerializedItem {
    metadata: SerializedItemMetadata;
    stringKeyedProperties: {
        [key: string]: SerializedItemPropertyValue;
    };
}

/**
 * Represents the type of property value,
 * if the property cannot be serialized directly.
 */
export enum SerializedItemPropertyValueType {

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
export interface SerializedItemReference {
    type: SerializedItemPropertyValueType.Reference;
    uuid: string;
}

/**
 * References another object in the serialization.
 */
export interface SerializedBigInt {
    type: SerializedItemPropertyValueType.BigInt;
    value: string;
}

/**
 * A value on a serialized object.
 */
export type SerializedItemPropertyValue =
    | number
    | bigint
    | string
    | boolean
    | null
    | undefined
    | SerializedItemReference
    | SerializedBigInt;
