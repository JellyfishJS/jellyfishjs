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
export enum SerializedItemType {

    /**
     * Indicates this serialized item is an object.
     */
    Object = 'object',

    /**
     * Indicates this serialized item is an array.
     */
    Array = 'array',

    /**
     * Indicates this serialized item has a custom prototype
     */
    Prototyped = 'prototyped',

}

/**
 * A serialized item that is an object.
 */
export interface SerializedItemObject {
    type: SerializedItemType.Object;
    stringKeyedProperties: {
        [key: string]: SerializedProperty;
    };
    symbolKeyedProperties: {
        [key: string]: SerializedProperty;
    };
}

/**
 * A serialized item that is an array.
 */
export interface SerializedItemArray {
    type: SerializedItemType.Array;
    stringKeyedProperties: {
        [key: string]: SerializedProperty;
    };
    symbolKeyedProperties: {
        [key: string]: SerializedProperty;
    };
}

/**
 * A serialized item that has a prototype.
 */
export interface SerializedItemPrototyped {
    type: SerializedItemType.Prototyped;
    prototype: string;
    stringKeyedProperties: {
        [key: string]: SerializedProperty;
    };
    symbolKeyedProperties: {
        [key: string]: SerializedProperty;
    };
}

/**
 * The serialization of a single item.
 *
 * Different kinds of items need to be deserialized differently.
 */
export type SerializedItem =
    | SerializedItemObject
    | SerializedItemArray
    | SerializedItemPrototyped;

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

    /**
     * Indicates this property is a Date.
     */
    Date = 'date',

    /**
     * Indicates this property is a Symbol.
     */
    Symbol = 'symbol',
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
 * Represents a property that is a Date.
 */
export interface SerializedPropertyDate {
    type: SerializedPropertyType.Date;
    // The number of milliseconds since Epoch, this value is retrieved from calling Date.getTime().
    timestamp: number;
}

/**
 * Represents a property that is a Symbol.
 */
export interface SerializedPropertySymbol {
    type: SerializedPropertyType.Symbol;
    name: string;
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
    | SerializedPropertyMap
    | SerializedPropertyDate
    | SerializedPropertySymbol;
