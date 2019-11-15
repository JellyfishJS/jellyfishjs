import { type } from 'os';
import uuid = require('uuid');
import {
    SerializableItem,
    SerializedEntity,
    SerializedItem,
    SerializedItemMetadata,
    SerializedItemMetadataType,
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
        if (!this.hasSerialized) {
            this._runSerialization();
            this.hasSerialized = true;
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
    private hasSerialized = false;

    /**
     * A cache of the serialized entity.
     */
    private _result: SerializedEntity = {
        rootItem: '',
        items: {},
    };

    private _serializableEntityToUUID = new Map<SerializableItem, string>();

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
        const existingUUID = this._serializableEntityToUUID.get(item);
        if (existingUUID) { return existingUUID; }

        const id = uuid();
        this._serializableEntityToUUID.set(item, id);

        const stringKeyedProperties: SerializedItem['stringKeyedProperties'] = {};

        Object.keys(item).forEach((key) => {
            const serializableProperty = item[key];

            stringKeyedProperties[key] = this._serializeProperty(serializableProperty);
        });

        let metadata: SerializedItemMetadata;

        if (Array.isArray(item)) {
            metadata = { type: SerializedItemMetadataType.Array };
        } else {
            metadata = { type: SerializedItemMetadataType.Object };
        }

        this._result.items[id] = {
            metadata,
            stringKeyedProperties,
        };

        return id;
    }

    /**
     * Serializes the specified property to a `SerializedProperty`.
     */
    private _serializeProperty(property: unknown): SerializedProperty {
        if (
            typeof property === 'string'
                || typeof property === 'number'
                || typeof property === 'boolean'
                || typeof property === 'bigint'
                || property === null
                || property === undefined
        ) {
            return property;
        }

        if (typeof property === 'bigint') {
            return {
                type: SerializedPropertyType.BigInt,
                // BigInt constructors don't take arbitrary radixes.
                value: property.toString(10),
            };
        }

        if (Array.isArray(property) || typeof property === 'object') {
            // property is a `SerializableEntity` at this point.
            return {
                type: SerializedPropertyType.Reference,
                uuid: this._serializeItem(property as SerializableItem),
            };
        }

        if (typeof property === 'function') {
            // Functions cannot (safely) be serialized.
            // Later, if we wish, we can register functions
            return undefined;
        }

        throw new Error(`Bad serialization: Unrecognized type of property ${property}.`);
    }

}
