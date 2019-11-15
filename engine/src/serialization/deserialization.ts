import {
    SerializableEntity,
    SerializedEntity,
    SerializedItemMetadataType,
    SerializedProperty,
    SerializedPropertyType,
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
    public constructor(object: SerializedEntity) {
        this._originalObject = object;
    }

    /**
     * Gets the deserialization of the object passed in to the constructor.
     *
     * Caches its result,
     * so don't modify the object and expect a different result.
     */
    public getDeserialization(): SerializableEntity {
        if (!this._result) {
            this._runDeserialization();
        }

        return this._result!;
    }

    /**
     * The object this deserialization deserializes.
     */
    private readonly _originalObject: SerializedEntity;

    /**
     * A map from UUIDs to objects.
     */
    private _uuidToObjects = new Map<string, SerializableEntity>();

    /**
     * A cache of the result of the deserialization.
     */
    private _result: SerializableEntity | undefined;

    /**
     * Deserializes the object passed in to the constructor.
     *
     * Caches things but does not check the caches.
     * Do not run twice,
     * or the results will be strange.
     */
    private _runDeserialization() {
        if (typeof this._originalObject.rootItem !== 'string') {
            throw new Error(`Bad deserialization: Property .rootItem is not a string in ${this._originalObject}.`);
        }

        this._result = this._deserializeObject(this._originalObject.rootItem);
    }

    /**
     * Deserializes the object with the specified ID,
     * and returns it.
     *
     * Caches results, so can be called multiple times.
     */
    private _deserializeObject(id: string): SerializableEntity {
        const existingObject = this._uuidToObjects.get(id);
        if (existingObject) { return existingObject; }

        let result: SerializableEntity;

        if (!this._originalObject.items) {
            throw new Error(`Bad deserialization: Missing key .objects in ${this._originalObject}.`);
        }

        const serializedObject = this._originalObject.items[id];

        if (!serializedObject) {
            throw new Error(`Bad deserialization: Missing key "${id}" in ${this._originalObject.items}.`);
        }

        if (serializedObject === null || typeof serializedObject !== 'object') {
            throw new Error(`Bad deserialization: Unexpected type of object "${serializedObject}" with type ${typeof serializedObject}.`);
        }

        if (serializedObject.metadata === null || typeof serializedObject.metadata !== 'object') {
            throw new Error(`Bad deserialization: Unexpected type of object "${serializedObject}" with type ${typeof serializedObject}.`);
        }

        switch (serializedObject.metadata.type) {
            case SerializedItemMetadataType.Array:
                // It is safe to treat an array like an object with arbitrary access,
                // it's just usually a bad idea so TypeScript complains.
                result = [] as unknown as SerializableEntity;
                break;
            case SerializedItemMetadataType.Object:
                result = {};
                break;
            default:
                throw new Error(`Bad deserialization: Unknown type "${(serializedObject.metadata as any).type}" in ${this._originalObject.items}.`);
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
    private _deserializePropertyValue(value: SerializedProperty): unknown {
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

        if (value === null || typeof value !== 'object') {
            throw new Error(`Bad deserialization: Unexpected value ${value} of type ${typeof value}.`);
        }

        switch (value.type) {
            case SerializedPropertyType.Reference:
                const uuid = value.uuid;
                if (typeof uuid !== 'string') {
                    throw new Error(`Bad deserialization: Property .uuid is not a string in ${value}.`);
                }

                return this._deserializeObject(uuid);

            case SerializedPropertyType.BigInt:
                if (typeof BigInt !== 'undefined') {
                    // Automatically throws if the value is not well-formed.
                    return BigInt(value.value);
                } else {
                    // If there is no BigInt support, fall back to using an integer.
                    // It gets the correct order of magnitude but loses some precision.
                    const result = parseInt(value.value, 10);
                    if (Number.isNaN(result)) {
                        throw new Error(`Bad deserialization: Cannot parse integer ${value.value}.`);
                    }
                    return result;
                }

            default:
                throw new Error(`Bad deserialization: Unknown value type ${(value as any).type}.`);
        }
    }

}
