import { type } from 'os';
import uuid = require('uuid');
import {
    SerializableEntity,
    SerializedEntity,
    SerializedItem,
    SerializedItemMetadata,
    SerializedItemMetadataType,
    SerializedItemPropertyValue,
    SerializedItemPropertyValueType,
} from './serialization-result';

/**
 * A class used to serialize a single object.
 *
 * This is basically just a method,
 * but it's it in its own class
 * because it caches many things
 * and this makes it easier.
 */
export class Serialization {

    /**
     * Makes a serialization for the specified object.
     */
    public constructor(object: SerializableEntity) {
        this._originalObject = object;
    }

    /**
     * Returns a serialized version of the specified object.
     *
     * Caches its result,
     * so don't modify the object and expect to be able to reserialize it.
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
    private readonly _originalObject: SerializableEntity;

    /**
     * If the object has been serialized yet.
     *
     * Used to determine if the cached version should be returned.
     */
    private hasSerialized = false;

    /**
     * A cache of the result of the serialization.
     */
    private _result: SerializedEntity = {
        rootItem: '',
        items: {},
    };

    private _objectsToUUID = new WeakMap<SerializableEntity, string>();

    /**
     * Serializes the object without caching the result.
     *
     * Do NOT call more than once.
     *
     * If this is called more than once,
     * then the saved intermediate results will still exist,
     * so it will not work correctly.
     */
    private _runSerialization() {
        this._result.rootItem = this._serializeObject(this._originalObject);
    }

    /**
     * Serializes the given object,
     * and adds it to the result.
     *
     * Returns the uuid the object was assigned.
     */
    private _serializeObject(object: SerializableEntity): string {
        const existingUUID = this._objectsToUUID.get(object);
        if (existingUUID) { return existingUUID; }

        const id = uuid();
        this._objectsToUUID.set(object, id);

        const stringKeyedProperties: SerializedItem['stringKeyedProperties'] = {};

        Object.keys(object).forEach((key) => {
            const value = object[key];

            stringKeyedProperties[key] = this._serializePropertyValue(value);
        });

        let metadata: SerializedItemMetadata;

        if (Array.isArray(object)) {
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
     * Converts the specified value to a `SerializedItemPropertyValue`.
     */
    private _serializePropertyValue(value: unknown): SerializedItemPropertyValue {
        if (
            typeof value === 'string'
                || typeof value === 'number'
                || typeof value === 'boolean'
                || typeof value === 'bigint'
                || value === null
                || value === undefined
        ) {
            return value;
        }

        if (typeof value === 'bigint') {
            return {
                type: SerializedItemPropertyValueType.BigInt,
                // BigInt constructors don't take arbitrary radixes.
                value: value.toString(10),
            };
        }

        if (Array.isArray(value) || typeof value === 'object') {
            // value is a `SerializableEntity` at this point.
            return {
                type: SerializedItemPropertyValueType.Reference,
                uuid: this._serializeObject(value as SerializableEntity),
            };
        }

        if (typeof value === 'function') {
            // Functions cannot (safely) be serialized.
            // Later, if we wish, we can register functions
            return undefined;
        }

        throw new Error(`Unrecognized type of value ${value}`);
    }

}
