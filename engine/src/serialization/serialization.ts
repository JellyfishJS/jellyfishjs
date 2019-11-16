import uuid = require('uuid');
import {
    SerializableItem,
    SerializedEntity,
    SerializedItem,
    SerializedItemType,
    SerializedProperty,
    SerializedPropertyType,
} from './serialization-result';

/**
 * A class used to serialize a single entity.
 *
 * This is basically just a method,
 * but it's it in its own class
 * because it caches many things
 * and this makes it easier.
 */
export class Serialization {

    /**
     * Makes a serialization for the specified entity.
     */
    public constructor(entity: SerializableItem) {
        this._serializableEntity = entity;
    }

    /**
     * Returns a serialized version of the specified entity.
     *
     * Caches its result,
     * so don't modify the entity and expect to be able to reserialize it.
     */
    public getSerialization(): SerializedEntity {
        if (!this._hasSerialized) {
            this._runSerialization();
            this._hasSerialized = true;
        }

        return this._result;
    }

    /**
     * The object this instance is serializing.
     *
     * Cannot be changed,
     * once an instance is serializing something,
     * that's the only thing it can serialize.
     */
    private readonly _serializableEntity: SerializableItem;

    /**
     * If the entity has been serialized yet.
     *
     * Used to determine if the cached version should be returned.
     */
    private _hasSerialized = false;

    /**
     * A cache of the serialized entity.
     */
    private _result: SerializedEntity = {
        rootItem: '',
        items: {},
    };

    private _serializableItemToUUID = new Map<SerializableItem, string>();

    /**
     * Serializes the entity without checking the cache.
     *
     * Do NOT call more than once.
     *
     * If this is called more than once,
     * then the saved intermediate results will still exist,
     * so it will not work correctly.
     */
    private _runSerialization() {
        this._result.rootItem = this._serializeItem(this._serializableEntity);
    }

    /**
     * Serializes the given item,
     * and adds it to the result.
     *
     * Returns the uuid the item was assigned.
     */
    private _serializeItem(item: SerializableItem): string {
        const existingUUID = this._serializableItemToUUID.get(item);
        if (existingUUID) { return existingUUID; }

        const id = uuid();
        this._serializableItemToUUID.set(item, id);

        this._result.items[id] = this._serializeItemObjectOrArray(item);

        return id;
    }

    /**
     * Serializes the specified item,
     * assuming it is an object or an array.
     */
    private _serializeItemObjectOrArray(item: SerializableItem): SerializedItem {
        const stringKeyedProperties: SerializedItem['stringKeyedProperties'] = {};

        Object.keys(item).forEach((key) => {
            stringKeyedProperties[key] = this._serializeProperty(item[key]);
        });

        return {
            type: Array.isArray(item) ? SerializedItemType.Array : SerializedItemType.Object,
            stringKeyedProperties,
        };
    }

    /**
     * Serializes the specified property to a `SerializedProperty`.
     */
    private _serializeProperty(property: unknown): SerializedProperty {
        if (
            typeof property === 'string'
                || typeof property === 'number'
                || typeof property === 'boolean'
                || property === null
                || property === undefined
        ) { return this._serializePropertyPrimitive(property); }

        if (typeof property === 'bigint') { return this._serializePropertyBigInt(property); }

        if (property instanceof Map) { return this._serializePropertyMap(property); }

        if (typeof property === 'object') { return this._serializePropertyReference(property as SerializableItem); }

        if (typeof property === 'function') {
            return this._serializePropertyFunction(property as (...args: any[]) => void);
        }

        throw new Error(`Bad serialization: Unrecognized type of property ${property}.`);
    }

    /**
     * Returns the specified property,
     * assuming it is a primitive.
     */
    private _serializePropertyPrimitive(property: string | number | boolean | null | undefined): SerializedProperty {
        return property;
    }

    /**
     * Returns the specified property,
     * assuming it is a bigint.
     */
    private _serializePropertyBigInt(property: bigint): SerializedProperty {
        return {
            type: SerializedPropertyType.BigInt,
            // BigInt constructors don't take arbitrary radixes.
            value: property.toString(10),
        };
    }

    /**
     * Returns the specified property,
     * assuming it is a bigint.
     */
    private _serializePropertyMap(property: Map<unknown, unknown>): SerializedProperty {
        return {
            type: SerializedPropertyType.Map,
            entries: Array.from(property.entries())
                .map(([key, value]) => [this._serializeProperty(key), this._serializeProperty(value)]),
        };
    }

    /**
     * Returns the specified property,
     * assuming it is a reference.
     */
    private _serializePropertyReference(property: SerializableItem): SerializedProperty {
        return {
            type: SerializedPropertyType.Reference,
            uuid: this._serializeItem(property as SerializableItem),
        };
    }

    /**
     * Returns the specified property,
     * assuming it is a function.
     */
    private _serializePropertyFunction(property: (...args: any[]) => void): SerializedProperty {
        // Functions cannot (safely) be serialized.
        // Later, if we wish, we can register functions
        return undefined;
    }

}
