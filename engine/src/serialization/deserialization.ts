import {
    SerializableItem,
    SerializedEntity,
    SerializedItemArray,
    SerializedItemObject,
    SerializedItemPrototyped,
    SerializedItemType,
    SerializedProperty,
    SerializedPropertyBigInt,
    SerializedPropertyDate,
    SerializedPropertyItemReference,
    SerializedPropertyMap,
    SerializedPropertySymbol,
    SerializedPropertyType,
} from './serialization-result';
import { SerializerConfiguration } from './serializer-configuration';

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
    public constructor(
        entity: SerializedEntity,
        entityToUpdate: SerializableItem | undefined,
        configuration: SerializerConfiguration,
    ) {
        this._originalEntity = entity;
        this._result = entityToUpdate;
        this._configuration = configuration;
    }

    /**
     * Gets the deserialization of the entity passed in to the constructor.
     *
     * Caches its result,
     * so don't modify the entity and expect a different result.
     */
    public getDeserialization(): SerializableItem {
        if (!this._hasDeserialized) {
            this._runDeserialization();
            this._hasDeserialized = true;
        }

        return this._result!;
    }

    /**
     * The configuration for this serialization to use.
     */
    private readonly _configuration: SerializerConfiguration;

    /**
     * The serialized entity this deserialization deserializes.
     */
    private readonly _originalEntity: SerializedEntity;

    /**
     * A map from UUIDs to items.
     */
    private _uuidToItems = new Map<string, SerializableItem>();

    /**
     * If the entity has been serialized yet.
     *
     * Used to determine if the cached version should be returned.
     */
    private _hasDeserialized = false;

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

        this._result = this._deserializeItem(this._originalEntity.rootItem, this._result);
    }

    /**
     * Deserializes the item with the specified ID,
     * and returns it.
     *
     * Caches results, so can be called multiple times.
     */
    private _deserializeItem(id: string, originalItem: SerializableItem | undefined): SerializableItem {
        const existingItem = this._uuidToItems.get(id);
        if (existingItem) { return existingItem; }

        if (!this._originalEntity.items) {
            throw new Error(`Bad deserialization: Missing key .items in ${this._originalEntity}.`);
        }

        const serializedItem = this._originalEntity.items[id];

        if (!serializedItem) {
            throw new Error(`Bad deserialization: Missing key "${id}" in ${this._originalEntity.items}.`);
        }

        if (typeof serializedItem !== 'object') {
            throw new Error(`Bad deserialization: Unexpected type of object "${serializedItem}" with type ${typeof serializedItem}.`);
        }

        switch (serializedItem.type) {
            case SerializedItemType.Array:
                return this._deserializeItemArray(id, serializedItem, originalItem);
            case SerializedItemType.Object:
                return this._deserializeItemObject(id, serializedItem, originalItem);
            case SerializedItemType.Prototyped:
                return this._deserializeItemPrototyped(id, serializedItem, originalItem);
            default:
                throw new Error(`Bad deserialization: Unknown type "${(serializedItem as any).type}" in ${this._originalEntity.items}.`);
        }
    }

    /**
     * Deserializes the specified array.
     */
    private _deserializeItemArray(
        id: string,
        serializedItem: SerializedItemArray,
        originalItem: SerializableItem | undefined,
    ): SerializableItem {
        // It is safe to treat an array like an object with arbitrary access,
        // it's just usually a bad idea so TypeScript complains.
        // Hence the `as unknown as SerializableItem`.
        const result: SerializableItem = Array.isArray(originalItem) ? originalItem : [] as unknown as SerializableItem;

        this._uuidToItems.set(id, result);

        if (typeof serializedItem.stringKeyedProperties !== 'object') {
            throw new Error(`Bad deserialization: Property .stringKeyedProperties is not an object in ${serializedItem}.`);
        }

        this._addPropertiesToItem(result, serializedItem.stringKeyedProperties);

        return result;
    }

    /**
     * Deserializes the specified object.
     */
    private _deserializeItemObject(
        id: string,
        serializedItem: SerializedItemObject,
        originalItem: SerializableItem | undefined,
    ): SerializableItem {
        const canUseOriginal =
            typeof originalItem === 'object'
            && originalItem !== null
            && !Array.isArray(originalItem);
        const result: SerializableItem = canUseOriginal ? originalItem as SerializableItem : {};

        this._uuidToItems.set(id, result);

        if (typeof serializedItem.stringKeyedProperties !== 'object') {
            throw new Error(`Bad deserialization: Property .stringKeyedProperties is not an object in ${serializedItem}.`);
        }
        this._addPropertiesToItem(result, serializedItem.stringKeyedProperties);
        return result;
    }

    /**
     * Deserializes the specified prototyped item.
     */
    private _deserializeItemPrototyped(
        id: string,
        serializedItem: SerializedItemPrototyped,
        originalItem: SerializableItem | undefined,
    ): SerializableItem {
        const configuration = this._configuration.prototypeNameToConfiguration.get(serializedItem.prototype);
        if (!configuration) {
            throw new Error(`Bad deserialization: Unrecognized prototype name: ${serializedItem.prototype}`);
        }

        const canUseOriginal = originalItem
            && typeof originalItem === 'object'
            && Object.getPrototypeOf(originalItem) === configuration.prototype;
        const result: SerializableItem = canUseOriginal
            ? originalItem as SerializableItem
            : Object.create(configuration.prototype);

        this._uuidToItems.set(id, result);

        if (typeof serializedItem.stringKeyedProperties !== 'object') {
            throw new Error(`Bad deserialization: Property .stringKeyedProperties is not an object in ${serializedItem}.`);
        }
        this._addPropertiesToItem(result, serializedItem.stringKeyedProperties);
        return result;
    }

    /**
     * Adds the specified properties to the specified item.
     */
    private _addPropertiesToItem(
        item: SerializableItem,
        properties: { [key: string]: SerializedProperty },
    ) {
        const existingKeys = Object.keys(item);
        const newKeys = Object.keys(properties);
        const newKeysSet = new Set(newKeys);
        const deletedKeys = existingKeys.filter((key) => !newKeysSet.has(key));

        deletedKeys.forEach((key) => { delete item[key]; });

        Object.keys(properties).forEach((key) => {
            const value = properties[key];
            item[key] = this._deserializePropertyValue(value, item[key]);
        });
    }

    /**
     * Deserializes the property and returns it.
     *
     * Caches results, so can be called multiple times.
     */
    private _deserializePropertyValue(property: SerializedProperty, originalValue: unknown): unknown {
        if (
            typeof property === 'string'
                || typeof property === 'number'
                || typeof property === 'boolean'
                || property === null
                || property === undefined
        ) {
            return this._deserializePropertyPrimitive(property);
        }

        if (Array.isArray(property)) {
            throw new Error(`Bad deserialization: Found a direct array property ${property}.`);
        }

        if (property === null || typeof property !== 'object') {
            throw new Error(`Bad deserialization: Unexpected property ${property} of type ${typeof property}.`);
        }

        switch (property.type) {
            case SerializedPropertyType.Reference: return this._deserializePropertyReference(property, originalValue);
            case SerializedPropertyType.BigInt: return this._deserializePropertyBigInt(property);
            case SerializedPropertyType.Date: return this._deserializePropertyDate(property);
            case SerializedPropertyType.Symbol: return this._deserializePropertySymbol(property);
            case SerializedPropertyType.Map: return this._deserializePropertyMap(property, originalValue);
            default: throw new Error(`Bad deserialization: Unknown value type ${(property as any).type}.`);
        }
    }

    /**
     * Deserializes the specified property, assuming it's a primitive.
     */
    private _deserializePropertyPrimitive(property: string | number | boolean | null | undefined): unknown {
        return property;
    }

    /**
     * Deserializes the specified property, assuming it's a reference.
     */
    private _deserializePropertyReference(property: SerializedPropertyItemReference, originalValue: unknown): unknown {
        const uuid = property.uuid;
        if (typeof uuid !== 'string') {
            throw new Error(`Bad deserialization: Property .uuid is not a string in ${property}.`);
        }

        let itemToReplace: SerializableItem | undefined;

        if (typeof originalValue === 'object' && originalValue !== null) {
            itemToReplace = originalValue as SerializableItem;
        }

        return this._deserializeItem(uuid, itemToReplace);
    }

    /**
     * Deserializes the specified property, assuming it's a reference.
     */
    private _deserializePropertyBigInt(property: SerializedPropertyBigInt): unknown {
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
    }

    /**
     * Deserializes the specified property, assuming it's a date.
     */
    private _deserializePropertyDate(property: SerializedPropertyDate): unknown {
        if (typeof property.timestamp as any !== 'number' || isNaN(property.timestamp)) {
            throw new Error(`Bad deserialization: Cannot parse date timestamp ${property.timestamp}.`);
        }
        return new Date(property.timestamp);
    }

    /**
     * Deserializes the specified property, assuming it's a date.
     */
    private _deserializePropertySymbol(property: SerializedPropertySymbol): unknown {
        const symbol = this._configuration.symbolNameToSymbol.get(property.name);
        if (!symbol) {
            throw new Error(`Bad deserialization: Unrecognized symbol name ${property.name}.`);
        }
        return symbol;
    }

    /**
     * Deserializes the specified property, assuming it's a map.
     */
    private _deserializePropertyMap(property: SerializedPropertyMap, originalValue: unknown): unknown {
        const entries = property.entries;
        if (!Array.isArray(entries)) {
            throw new Error(`Bad deserialization: Map entries is not list: ${entries}.`);
        }

        entries.forEach((entry) => {
            if (!Array.isArray(entry) || entry.length !== 2) {
                throw new Error(`Bad deserialization: Map entry is not a pair: ${entry}`);
            }
        });

        let result: Map<unknown, unknown>;

        if (originalValue instanceof Map) {
            result = originalValue;
        } else {
            result = new Map();
        }

        const addedKeys = new Set<unknown>();

        entries.forEach(([key, value]) => {
            const deserializedKey = this._deserializePropertyValue(key, undefined);
            addedKeys.add(deserializedKey);
            result.set(
                deserializedKey,
                this._deserializePropertyValue(value, result.get(deserializedKey)),
            );
        });

        Array.from(result.keys()).filter((key) => !addedKeys.has(key)).forEach((key) => {
            result.delete(key);
        });

        return result;
    }

}
