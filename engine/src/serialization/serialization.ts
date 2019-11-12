import { type } from 'os';
import uuid = require('uuid');
import {
    SerializableObject,
    SerializationResult,
    SerializedObject,
    SerializedObjectPropertyValue,
    SerializedObjectPropertyValueType,
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
    public constructor(object: SerializableObject) {
        this._originalObject = object;
    }

    /**
     * Returns a serialized version of the specified object.
     *
     * Caches its result,
     * so don't modify the object and expect to be able to reserialize it.
     */
    public getSerialization(): SerializationResult {
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
    private readonly _originalObject: SerializableObject;

    /**
     * If the object has been serialized yet.
     *
     * Used to determine if the cached version should be returned.
     */
    private hasSerialized = false;

    /**
     * A cache of the result of the serialization.
     */
    private _result: SerializationResult = {
        rootObject: '',
        objects: {},
    };

    private _objectsToUUID = new WeakMap<SerializableObject, string>();

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
        this._result.rootObject = this._getSerializationOfObject(this._originalObject);
    }

    /**
     * Serializes the given object,
     * and adds it to the result.
     *
     * Returns the uuid the object was assigned.
     */
    private _getSerializationOfObject(object: SerializableObject): string {
        const existingUUID = this._objectsToUUID.get(object);
        if (existingUUID) { return existingUUID; }

        const id = uuid();
        this._objectsToUUID.set(object, id);

        const stringKeyedProperties: SerializedObject['stringKeyedProperties'] = {};

        Object.keys(object).forEach((key) => {
            const value = object[key];

            stringKeyedProperties[key] = this._valueToSerializedValue(value);
        });

        this._result.objects[id] = {
            stringKeyedProperties,
        };

        return id;
    }

    /**
     * Converts the specified value to a `SerializedObjectPropertyValue`.
     */
    private _valueToSerializedValue(value: unknown): SerializedObjectPropertyValue {
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

        if (Array.isArray(value)) {
            return value.map((subvalue: unknown) => this._valueToSerializedValue(subvalue));
        }

        if (typeof value === 'object') {
            // value is a `SerializableObject` at this point.
            return {
                type: SerializedObjectPropertyValueType.Reference,
                uuid: this._getSerializationOfObject(value as SerializableObject),
            };
        }

        throw new Error(`Unrecognized type of value ${value}`);
    }

}
