import {
    SerializableItem,
    SerializedEntity,
    SerializedItemArray,
    SerializedItemMap,
    SerializedItemObject,
    SerializedItemPrototyped,
    SerializedItemSet,
    SerializedItemType,
    SerializedProperty,
    SerializedPropertyBigInt,
    SerializedPropertyDate,
    SerializedPropertyItemReference,
    SerializedPropertyRegExp,
    SerializedPropertySymbol,
    SerializedPropertyType,
} from './serialization-result';
import type { PrototypeConfiguration, SerializerConfiguration } from './serializer-configuration';

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
     * A map from IDs to items.
     */
    private _idToItems = new Map<number, SerializableItem>();

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
        if (typeof this._originalEntity.rootItem !== 'number') {
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
    private _deserializeItem(id: number, originalItem: SerializableItem | undefined): SerializableItem | undefined {
        const existingItem = this._idToItems.get(id);
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
            case SerializedItemType.NoUpdate:
                return originalItem;
            case SerializedItemType.Map:
                return this._deserializeItemMap(id, serializedItem, originalItem);
            case SerializedItemType.Set:
                return this._deserializeItemSet(id, serializedItem, originalItem);
            default:
                throw new Error(`Bad deserialization: Unknown type "${(serializedItem as any).type}" in ${this._originalEntity.items}.`);
        }
    }

    /**
     * Deserializes the specified array.
     */
    private _deserializeItemArray(
        id: number,
        serializedItem: SerializedItemArray,
        originalItem: SerializableItem | undefined,
    ): SerializableItem {
        // It is safe to treat an array like an object with arbitrary access,
        // it's just usually a bad idea so TypeScript complains.
        // Hence the `as unknown as SerializableItem`.
        const result: SerializableItem = Array.isArray(originalItem) ? originalItem : [] as unknown as SerializableItem;

        this._idToItems.set(id, result);

        if (typeof serializedItem.stringKeyedProperties !== 'object') {
            throw new Error(`Bad deserialization: Property .stringKeyedProperties is not an object in ${serializedItem}.`);
        }

        this._addPropertiesToItem(result, serializedItem.stringKeyedProperties);
        this._addSymbolPropertiesToItem(result, serializedItem.symbolKeyedProperties);

        return result;
    }

    /**
     * Deserializes the specified object.
     */
    private _deserializeItemObject(
        id: number,
        serializedItem: SerializedItemObject,
        originalItem: SerializableItem | undefined,
    ): SerializableItem {
        const canUseOriginal =
            typeof originalItem === 'object'
            && originalItem !== null
            && !Array.isArray(originalItem);
        const result: SerializableItem = canUseOriginal ? originalItem as SerializableItem : {};

        this._idToItems.set(id, result);

        if (typeof serializedItem.stringKeyedProperties !== 'object') {
            throw new Error(`Bad deserialization: Property .stringKeyedProperties is not an object in ${serializedItem}.`);
        }
        this._addPropertiesToItem(result, serializedItem.stringKeyedProperties);
        this._addSymbolPropertiesToItem(result, serializedItem.symbolKeyedProperties);
        return result;
    }

    /**
     * Deserializes the specified prototyped item.
     */
    private _deserializeItemPrototyped(
        id: number,
        serializedItem: SerializedItemPrototyped,
        originalItem: SerializableItem | undefined,
    ): SerializableItem {
        const configurations = this._getConfigurationsForPrototype(serializedItem.prototype);
        const configuration = configurations[configurations.length - 1];

        const canUseOriginal = originalItem
            && typeof originalItem === 'object'
            && Object.getPrototypeOf(originalItem) === configuration.prototype;
        const result: SerializableItem = canUseOriginal
            ? originalItem as SerializableItem
            : Object.create(configuration.prototype);

        this._idToItems.set(id, result);

        if (typeof serializedItem.stringKeyedProperties !== 'object') {
            throw new Error(`Bad deserialization: Property .stringKeyedProperties is not an object in ${serializedItem}.`);
        }

        const stringKeyBlacklist = this._getBlacklistedProperties(
            serializedItem.stringKeyedProperties,
            (key) => key,
            canUseOriginal ? originalItem : undefined,
            configurations,
        );

        const symbolKeyBlacklist = this._getBlacklistedProperties(
            serializedItem.symbolKeyedProperties,
            (key) => this._getSymbolFromName(key),
            canUseOriginal ? originalItem : undefined,
            configurations,
        );

        this._addPropertiesToItem(result, serializedItem.stringKeyedProperties, stringKeyBlacklist);
        this._addSymbolPropertiesToItem(result, serializedItem.symbolKeyedProperties, symbolKeyBlacklist);
        return result;
    }

    /**
     * Deserializes the specified Map.
     */
    private _deserializeItemMap(
        id: number,
        serializedItem: SerializedItemMap,
        originalItem: SerializableItem | undefined,
    ): SerializableItem {
        const canUseOriginal =
            typeof originalItem === 'object'
            && originalItem instanceof Map;
        const result: Map<any, any> = canUseOriginal ? originalItem as unknown as Map<any, any> : new Map();

        this._idToItems.set(id, result as unknown as SerializableItem);

        const entries = serializedItem.entries;
        if (!Array.isArray(entries)) {
            throw new Error(`Bad deserialization: Map entries is not list: ${entries}.`);
        }

        entries.forEach((entry) => {
            if (!Array.isArray(entry) || entry.length !== 2) {
                throw new Error(`Bad deserialization: Map entry is not a pair: ${entry}`);
            }
        });

        const addedKeys = new Set<unknown>();

        entries.forEach(([key, value]) => {
            const deserializedKey = this._deserializePropertyValue(key, undefined);
            addedKeys.add(deserializedKey);
            result.set(
                deserializedKey,
                this._deserializePropertyValue(value, result.get(deserializedKey)),
            );
        });

        // TODO: At some point we'll want to make this configurable.
        // See https://github.com/NicholasThrom/jellyfishjs/issues/174
        if (false) {
            Array.from(result.keys()).filter((key) => !addedKeys.has(key)).forEach((key) => {
                result.delete(key);
            });
        }

        return result as unknown as SerializableItem;
    }

    /**
     * Deserializes the specified Set.
     */
    private _deserializeItemSet(
        id: number,
        serializedItem: SerializedItemSet,
        originalItem: SerializableItem | undefined,
    ): SerializableItem {
        const canUseOriginal =
            typeof originalItem === 'object'
            && originalItem instanceof Set;
        const result: Set<any> = canUseOriginal ? originalItem as unknown as Set<any> : new Set();

        this._idToItems.set(id, result as unknown as SerializableItem);

        const entries = serializedItem.entries;
        if (!Array.isArray(entries)) {
            throw new Error(`Bad deserialization: Set entries is not list: ${entries}.`);
        }

        const addedKeys = new Set<unknown>();

        entries.forEach((entry) => {
            const deserialized = this._deserializePropertyValue(entry, undefined);
            addedKeys.add(deserialized);
            result.add(deserialized);
        });

        Array.from(result.keys()).filter((key) => !addedKeys.has(key)).forEach((key) => {
            result.delete(key);
        });

        return result as unknown as SerializableItem;
    }

    /**
     * Adds the specified properties to the specified item.
     */
    private _addPropertiesToItem(
        item: SerializableItem,
        properties: { [key: string]: SerializedProperty },
        blacklist?: Set<string>,
    ) {
        const existingKeys = Object.keys(item);
        const newKeys = Object.keys(properties);
        const newKeysSet = new Set(newKeys);
        const deletedKeys = existingKeys.filter((key) => !newKeysSet.has(key));

        deletedKeys.forEach((key) => { delete item[key]; });

        Object.keys(properties).forEach((key) => {
            const value = properties[key];
            if (!blacklist || !blacklist.has(key)) {
                item[key] = this._deserializePropertyValue(value, item[key]);
            }
        });
    }

    /**
     * Adds the specified properties to the specified item.
     */
    private _addSymbolPropertiesToItem(
        item: SerializableItem,
        properties: { [key: string]: SerializedProperty },
        blacklist?: Set<symbol>,
    ) {
        Object.keys(properties).forEach((key) => {
            const symbol = this._getSymbolFromName(key);

            if (!blacklist || !blacklist.has(symbol)) {
                item[symbol as any] = this._deserializePropertyValue(properties[key], item[symbol as any]);
            }
        });
    }

    /**
     * Gets the symbol object for a given symbol name.
     */
    private _getSymbolFromName(name: string): symbol {
        const symbol = this._configuration.symbolNameToSymbol.get(name);
        if (!symbol) {
            throw new Error(`Bad deserialization: Unrecognized symbol name ${name}.`);
        }
        return symbol;
    }

    /**
     * Gets the set of properties that are blacklisted.
     */
    private _getBlacklistedProperties<T extends string | symbol>(
        properties: {[key: string]: SerializedProperty},
        keyToObj: (key: string) => T,
        item: SerializableItem | undefined,
        configurations: PrototypeConfiguration<unknown>[] = [],
    ): Set<T> {
        const result = new Set<T>();
        Object.keys(properties).forEach((key) => {
            const keyObj = keyToObj(key);
            if (this._isKeyBlacklisted(keyObj, item, configurations)) {
                result.add(keyObj);
            }
        });
        return result;
    }

    /**
     * Returns `true` if the specified key of the specified item
     * is blacklisted.
     */
    private _isKeyBlacklisted(
        key: string | symbol,
        item: SerializableItem | undefined,
        configurations: PrototypeConfiguration<unknown>[] = [],
    ): boolean {
        for (const configuration of configurations) {
            if (
                typeof configuration.deserializationBlacklistedKeys === 'function'
                && configuration.deserializationBlacklistedKeys(key, item)
            ) {
                return true;
            }

            if (
                configuration.deserializationBlacklistedKeys instanceof Set
                && configuration.deserializationBlacklistedKeys.has(key)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns the configuration for all the prototypes
     * from which the specified object inherits.
     */
    private _getConfigurationsForPrototype(name: string): PrototypeConfiguration<unknown>[] {
        const configuration = this._configuration.prototypeNameToConfiguration.get(name)!;
        const parent = this._configuration.prototypeToName.get(Object.getPrototypeOf(configuration.prototype));
        if (!parent) {
            return [configuration];
        }
        return [...this._getConfigurationsForPrototype(parent), configuration];
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
            case SerializedPropertyType.RegExp: return this._deserializePropertyRegExp(property);
            case SerializedPropertyType.NoUpdate: return originalValue;
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
        const id = property.id;
        if (typeof id !== 'number') {
            throw new Error(`Bad deserialization: Property .id is not a string in ${property}.`);
        }

        let itemToReplace: SerializableItem | undefined;

        if (typeof originalValue === 'object' && originalValue !== null) {
            itemToReplace = originalValue as SerializableItem;
        }

        return this._deserializeItem(id, itemToReplace);
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
     * Deserializes the specified property, assuming it's a symbol.
     */
    private _deserializePropertySymbol(property: SerializedPropertySymbol): unknown {
        const symbol = this._configuration.symbolNameToSymbol.get(property.name);
        if (!symbol) {
            throw new Error(`Bad deserialization: Unrecognized symbol name ${property.name}.`);
        }
        return symbol;
    }

    /**
     * Deserializes the specified property, assuming it's a regular expression.
     */
    private _deserializePropertyRegExp(property: SerializedPropertyRegExp): unknown {
        if (typeof property.source as any !== 'string') {
            throw new Error(`Bad deserialization: Invalid regex source "${property.source}".`);
        }
        if (typeof property.flags as any !== 'string') {
            throw new Error(`Bad deserialization: Invalid regex flags "${property.flags}".`);
        }
        try {
            return new RegExp(property.source, property.flags);
        } catch (e) {
            throw new Error(`Bad deserialization: Invalild regex "${property.source}" with flags "${property.flags}": ${e.message}.`);
        }
    }

}
