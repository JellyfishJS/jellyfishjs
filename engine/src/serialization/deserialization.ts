import {
    SerializableObject,
    SerializationResult,
    SerializedObjectPropertyValue,
    SerializedObjectPropertyValueType,
    SerializedObjectType,
} from './serialization-result';

/**
 * A class used to deserialize a single object.
 *
 * This is basically just a method,
 * but it's it in its own class
 * because it caches many things
 * and this makes it easier.
 */
export class Deserialization {

    /**
     * Makes a deserialization for the specified serialization.
     */
    public constructor(object: SerializationResult) {
        this._originalObject = object;
    }

    /**
     * Gets the deserialization of the object passed in to the constructor.
     *
     * Caches its result,
     * so don't modify the object and expect a different result.
     */
    public getDeserialization(): SerializableObject {
        if (!this._result) {
            this._runDeserialization();
        }

        return this._result!;
    }

    /**
     * The object this deserialization deserializes.
     */
    private readonly _originalObject: SerializationResult;

    /**
     * A map from UUIDs to objects.
     */
    private _uuidToObjects = new Map<string, SerializableObject>();

    /**
     * A cache of the result of the deserialization.
     */
    private _result: SerializableObject | undefined;

    /**
     * Deserializes the object passed in to the constructor.
     *
     * Caches things but does not check the caches.
     * Do not run twice,
     * or the results will be strange.
     */
    private _runDeserialization() {
        if (typeof this._originalObject.rootObject !== 'string') {
            throw new Error(`Bad deserialization: Property .rootObject is not a string in ${this._originalObject}.`);
        }

        this._result = this._deserializeObject(this._originalObject.rootObject);
    }

    /**
     * Deserializes the object with the specified ID,
     * and returns it.
     *
     * Caches results, so can be called multiple times.
     */
    private _deserializeObject(id: string): SerializableObject {
        const existingObject = this._uuidToObjects.get(id);
        if (existingObject) { return existingObject; }

        let result: SerializableObject;

        if (!this._originalObject.objects) {
            throw new Error(`Bad deserialization: Missing key .objects in ${this._originalObject}.`);
        }

        const serializedObject = this._originalObject.objects[id];

        if (!serializedObject) {
            throw new Error(`Bad deserialization: Missing key "${id}" in ${this._originalObject.objects}.`);
        }

        switch (serializedObject.type) {
            case SerializedObjectType.Array:
                // It is safe to treat an array like an object with arbitrary access,
                // it's just usually a bad idea so TypeScript complains.
                result = [] as unknown as SerializableObject;
                break;
            case SerializedObjectType.Object:
                result = {};
                break;
            default:
                throw new Error(`Bad deserialization: Unknown type "${serializedObject.type}" in ${this._originalObject.objects}.`);
        }

        this._uuidToObjects.set(id, result);

        if (typeof serializedObject.stringKeyedProperties !== 'object') {
            throw new Error(`Bad deserialization: Property .stringKeyedProperties is not an object in ${serializedObject}.`);
        }

        Object.keys(serializedObject.stringKeyedProperties).forEach((key) => {
            const value = serializedObject.stringKeyedProperties[key];
            result[key] = this._deserializePropertyValue(value);
        });

        return result;
    }

    /**
     * Deserializes the object with the specified ID,
     * and returns it.
     *
     * Caches results, so can be called multiple times.
     */
    private _deserializePropertyValue(value: SerializedObjectPropertyValue): unknown {
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
            throw new Error(`Bad deserialization: Found a direct array value ${value}.`);
        }

        switch (value.type) {
            case SerializedObjectPropertyValueType.Reference:
                const uuid = value.uuid;
                if (typeof uuid !== 'string') {
                    throw new Error(`Bad deserialization: Property .uuid is not a string in ${value}.`);
                }

                return this._deserializeObject(uuid);

            default:
                throw new Error(`Bad deserialization: Unknown value type ${value.type}`);
        }
    }

}
