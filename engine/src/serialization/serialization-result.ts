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
    rootItem: number;
    items: {
        [uuid: number]: SerializedItem,
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

    /**
    * Indicates this serialized item is a Map.
    */
    Map = 'map',

    /**
    * Indicates this serialized item is a Set.
    */
    Set = 'set',

    /**
     * Indicates this serialized item should not be updated.
     */
    NoUpdate = 'noupdate',
}

/**
 * One of the interfaces many of the serializations share.
 *
 * These items have properties,
 * both string and symbol keyed.
 */
interface HasProperties {
    stringKeyedProperties: {
        [key: string]: SerializedProperty,
    };
    symbolKeyedProperties: {
        [key: string]: SerializedProperty,
    };
}

/**
 * A serialized item that is an object.
 */
export interface SerializedItemObject extends HasProperties {
    type: SerializedItemType.Object;
}

/**
 * A serialized item that is an array.
 */
export interface SerializedItemArray extends HasProperties {
    type: SerializedItemType.Array;
}

/**
 * A serialized item that has a prototype.
 */
export interface SerializedItemPrototyped extends HasProperties {
    type: SerializedItemType.Prototyped;
    prototype: string;
}

/**
 * A serialized item where the corresponding Object should not be updated on deserialization.
 */
export interface SerializedItemNoUpdate {
    type: SerializedItemType.NoUpdate;
}

/**
 * Represent an item that is a Map.
 */
export interface SerializedItemMap {
    type: SerializedItemType.Map;
    entries: [SerializedProperty, SerializedProperty][];
}

/**
 * Represent an item that is a Set.
 */
export interface SerializedItemSet {
    type: SerializedItemType.Set;
    entries: SerializedProperty[];
}

/**
 * The serialization of a single item.
 *
 * Different kinds of items need to be deserialized differently.
 */
export type SerializedItem =
    | SerializedItemObject
    | SerializedItemArray
    | SerializedItemPrototyped
    | SerializedItemNoUpdate
    | SerializedItemMap
    | SerializedItemSet;

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
     * Indicates this property is a Date.
     */
    Date = 'date',

    /**
     * Indicates this property is a Symbol.
     */
    Symbol = 'symbol',

    /**
     * Indicates this property is a regex.
     */
    RegExp = 'regex',

    /**
     * Indicates this property should not be updated.
     */
    NoUpdate = 'noupdate',
}

/**
 * References another item in the serialized entity.
 */
export interface SerializedPropertyItemReference {
    type: SerializedPropertyType.Reference;
    id: number;
}

/**
 * Represents a property that is a BigInt.
 */
export interface SerializedPropertyBigInt {
    type: SerializedPropertyType.BigInt;
    value: string;
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
 * Represents a property that is a regular expression.
 */
export interface SerializedPropertyRegExp {
    type: SerializedPropertyType.RegExp;
    source: string;
    flags: string;
}

/**
 * Represents a property that should not be updated.
 */
export interface SerializedPropertyNoUpdate {
    type: SerializedPropertyType.NoUpdate;
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
    | SerializedPropertyDate
    | SerializedPropertySymbol
    | SerializedPropertyRegExp
    | SerializedPropertyNoUpdate;
