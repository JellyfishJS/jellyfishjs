/**
 * Any entity or item that can be serialized.
 */
export interface SerializableItem {
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
 * Represents what kind of item a serialized item is.
 *
 * These potentially require different deserialization.
 */
export enum SerializedItemMetadataType {

    /**
     * Indicates this serialized item is an object.
     */
    Object = 'object',

    /**
     * Indicates this serialized item is an array.
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
 * The serialization of a single item.
 */
export interface SerializedItem {
    metadata: SerializedItemMetadata;
    stringKeyedProperties: {
        [key: string]: SerializedProperty;
    };
}

/**
 * Represents the type of the property,
 * if the property cannot be represented by a literal.
 */
export enum SerializedPropertyType {

    /**
     * Indicates this property references another serialized item.
     */
    Reference = 'reference',

    /**
     * Indicates this property is a big integer.
     */
    BigInt = 'bigint',

    /**
     * Indicates this property is a Map.
     */
    Map = 'map',

}

/**
 * References another item in the serialized entity.
 */
export interface SerializedPropertyItemReference {
    type: SerializedPropertyType.Reference;
    uuid: string;
}

/**
 * Represents a property that is a BigInt.
 */
export interface SerializedPropertyBigInt {
    type: SerializedPropertyType.BigInt;
    value: string;
}

/**
 * Represent a property that is a Map.
 */
export interface SerializedPropertyMap {
    type: SerializedPropertyType.Map;
    entries: [SerializedProperty, SerializedProperty][];
}

/**
 * A property of a serialized item.
 */
export type SerializedProperty =
    | number
    | string
    | boolean
    | null
    | undefined
    | SerializedPropertyItemReference
    | SerializedPropertyBigInt
    | SerializedPropertyMap;
