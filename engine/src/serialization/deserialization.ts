import {
    SerializableItem,
    SerializedEntity,
    SerializedItemMetadataType,
    SerializedProperty,
    SerializedPropertyType,
} from './serialization-result';

/**
 * A class used to deserialize a single entity.
 *
 * This is basically just a method,
 * but it's it in its own class
 * because it caches many things
 * and this makes it easier.
 */
export class Deserialization {

    /**
     * Makes a deserialization for the specified serialized entity.
     */
    public constructor(entity: SerializedEntity) {
        this._originalEntity = entity;
    }

    /**
     * Gets the deserialization of the entity passed in to the constructor.
     *
     * Caches its result,
     * so don't modify the entity and expect a different result.
     */
    public getDeserialization(): SerializableItem {
        if (!this._result) {
            this._runDeserialization();
        }

        return this._result!;
    }

    /**
     * The serialized entity this deserialization deserializes.
     */
    private readonly _originalEntity: SerializedEntity;

    /**
     * A map from UUIDs to items.
     */
    private _uuidToItems = new Map<string, SerializableItem>();

    /**
     * A cache of the result of the deserialization.
     */
    private _result: SerializableItem | undefined;

    /**
     * Deserializes the entity passed in to the constructor.
     *
     * Do NOT call more than once.
     *
     * If this is called more than once,
     * then the saved intermediate results will still exist,
     * so it will not work correctly.
     */
    private _runDeserialization() {
        if (typeof this._originalEntity.rootItem !== 'string') {
            throw new Error(`Bad deserialization: Property .rootItem is not a string in ${this._originalEntity}.`);
        }

        this._result = this._deserializeItem(this._originalEntity.rootItem);
    }

    /**
     * Deserializes the item with the specified ID,
     * and returns it.
     *
     * Caches results, so can be called multiple times.
     */
    private _deserializeItem(id: string): SerializableItem {
        const existingItem = this._uuidToItems.get(id);
        if (existingItem) { return existingItem; }

        if (!this._originalEntity.items) {
            throw new Error(`Bad deserialization: Missing key .items in ${this._originalEntity}.`);
        }

        const serializedObject = this._originalEntity.items[id];

        if (!serializedObject) {
            throw new Error(`Bad deserialization: Missing key "${id}" in ${this._originalEntity.items}.`);
        }

        if (serializedObject === null || typeof serializedObject !== 'object') {
            throw new Error(`Bad deserialization: Unexpected type of object "${serializedObject}" with type ${typeof serializedObject}.`);
        }

        if (serializedObject.metadata === null || typeof serializedObject.metadata !== 'object') {
            throw new Error(`Bad deserialization: Unexpected type of metadata "${serializedObject}" with type ${typeof serializedObject}.`);
        }

        let result: SerializableItem;

        switch (serializedObject.metadata.type) {
            case SerializedItemMetadataType.Array:
                // It is safe to treat an array like an object with arbitrary access,
                // it's just usually a bad idea so TypeScript complains.
                result = [] as unknown as SerializableItem;
                break;
            case SerializedItemMetadataType.Object:
                result = {};
                break;
            default:
                throw new Error(`Bad deserialization: Unknown type "${(serializedObject.metadata as any).type}" in ${this._originalEntity.items}.`);
        }

        this._uuidToItems.set(id, result);

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
     * Deserializes the property and returns it.
     *
     * Caches results, so can be called multiple times.
     */
    private _deserializePropertyValue(property: SerializedProperty): unknown {
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

        if (Array.isArray(property)) {
            throw new Error(`Bad deserialization: Found a direct array property ${property}.`);
        }

        if (property === null || typeof property !== 'object') {
            throw new Error(`Bad deserialization: Unexpected property ${property} of type ${typeof property}.`);
        }

        switch (property.type) {
            case SerializedPropertyType.Reference:
                const uuid = property.uuid;
                if (typeof uuid !== 'string') {
                    throw new Error(`Bad deserialization: Property .uuid is not a string in ${property}.`);
                }

                return this._deserializeItem(uuid);

            case SerializedPropertyType.BigInt:
                if (typeof BigInt !== 'undefined') {
                    // Automatically throws if the value is not well-formed.
                    return BigInt(property.value);
                } else {
                    // If there is no BigInt support, fall back to using an integer.
                    // It gets the correct order of magnitude but loses some precision.
                    const result = parseInt(property.value, 10);
                    if (Number.isNaN(result)) {
                        throw new Error(`Bad deserialization: Cannot parse integer ${property.value}.`);
                    }
                    return result;
                }

            default:
                throw new Error(`Bad deserialization: Unknown value type ${(property as any).type}.`);
        }
    }

}
