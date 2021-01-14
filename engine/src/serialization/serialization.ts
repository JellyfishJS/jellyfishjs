import {
    SerializableItem,
    SerializedEntity,
    SerializedItem,
    SerializedItemObject,
    SerializedItemType,
    SerializedProperty,
    SerializedPropertyType,
} from './serialization-result';
import type { PrototypeConfiguration, SerializerConfiguration } from './serializer-configuration';

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
    public constructor(entity: SerializableItem, configuration: SerializerConfiguration) {
        this._serializableEntity = entity;
        this._configuration = configuration;
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
     * The configuration for this serialization to use.
     */
    private readonly _configuration: SerializerConfiguration;

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
     * The ID to use for the next item to be serialized.
     */
    private _nextId = 1;

    /**
     * A cache of the serialized entity.
     */
    private _result: SerializedEntity = {
        rootItem: 0,
        items: {},
    };

    private _serializableItemToID = new Map<SerializableItem, number>();

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
     * Returns the ID the item was assigned.
     */
    private _serializeItem(item: SerializableItem): number {
        const existingID = this._serializableItemToID.get(item);
        if (existingID) { return existingID; }

        const id = this._nextId++;
        this._serializableItemToID.set(item, id);

        const prototype: unknown = Object.getPrototypeOf(item);
        if (prototype === Map.prototype) {
            this._result.items[id] = this._serializeItemMap(item as unknown as Map<any, any>);
        } else if (prototype === Set.prototype) {
            this._result.items[id] = this._serializeItemSet(item as unknown as Set<any>);
        } else if (
            prototype === Object.getPrototypeOf({})
            || prototype === Object.getPrototypeOf([])
            || prototype === null
        ) {
            this._result.items[id] = this._serializeItemObjectOrArray(item);
        } else {
            const name = this._getNameOfPrototype(prototype);
            const configurations = this._getConfigurationsForPrototype(prototype);

            this._result.items[id] = this._serializeItemPrototyped(item, name, configurations);
        }

        return id;
    }

    /**
     * Serializes the specified item,
     * with a custom prototype configuration
     */
    private _serializeItemPrototyped(
        item: SerializableItem,
        name: string,
        configurations: PrototypeConfiguration<unknown>[],
    ): SerializedItem {
        if (this._isItemBlacklisted(item, configurations)) {
            return this._serializeItemNoUpdate();
        }

        return {
            ...this._getProperties(item, configurations),
            type: SerializedItemType.Prototyped,
            prototype: name,
        };
    }

    /**
     * Serializes the specified item,
     * assuming it is an object or an array.
     */
    private _serializeItemObjectOrArray(item: SerializableItem): SerializedItem {
        return {
            ...this._getProperties(item),
            type: Array.isArray(item) ? SerializedItemType.Array : SerializedItemType.Object,
        };
    }

    /**
     * Returns the properties on the specified item.
     */
    private _getProperties(item: SerializableItem, configurations?: PrototypeConfiguration<unknown>[]) {
        const stringKeyedProperties: SerializedItemObject['stringKeyedProperties'] = {};
        const symbolKeyedProperties: SerializedItemObject['symbolKeyedProperties'] = {};

        Object.keys(item).forEach((key) => {
            if (this._isKeyBlacklisted(key, item, configurations)) {
                stringKeyedProperties[key] = this._serializePropertyNoUpdate();
            } else {
                stringKeyedProperties[key] = this._serializeProperty(item[key]);
            }
        });

        Object.getOwnPropertySymbols(item).forEach((symbol) => {
            const name = this._configuration.symbolToName.get(symbol);
            if (!name) {
                // Unknown symbols are ignored.
                return;
            }

            if (this._isKeyBlacklisted(symbol, item, configurations)) {
                symbolKeyedProperties[name] = this._serializePropertyNoUpdate();
            } else {
                // TypeScript doesn't support symbol indexers yet
                // https://github.com/microsoft/TypeScript/issues/1863
                // Hence the as any.
                symbolKeyedProperties[name] = this._serializeProperty(item[symbol as any]);
            }
        });

        return {
            stringKeyedProperties,
            symbolKeyedProperties,
        };
    }

    /**
     * Returns `true` if the specified key of the specified item
     * is blacklisted.
     */
    private _isKeyBlacklisted(
        key: string | symbol,
        item: SerializableItem,
        configurations: PrototypeConfiguration<unknown>[] = [],
    ): boolean {
        for (const configuration of configurations) {
            if (
                typeof configuration.serializationBlacklistedKeys === 'function'
                && configuration.serializationBlacklistedKeys(key, item)
            ) {
                return true;
            }

            if (
                configuration.serializationBlacklistedKeys instanceof Set
                && configuration.serializationBlacklistedKeys.has(key)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns `true` if the specified item is blacklisted.
     */
    private _isItemBlacklisted(
        item: SerializableItem,
        configurations: PrototypeConfiguration<unknown>[] = [],
    ): boolean {
        for (const configuration of configurations) {
            if (
                typeof configuration.blacklistItem === 'function' && configuration.blacklistItem(item) ||
                configuration.blacklistItem === true
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Serializes the specified item,
     * assuming it is an no update item.
     */
    private _serializeItemNoUpdate(): SerializedItem {
        return {
            type: SerializedItemType.NoUpdate,
        };
    }

    /**
     * Returns the specified item,
     * assuming it is a Map.
     */
    private _serializeItemMap(property: Map<unknown, unknown>): SerializedItem {
        return {
            type: SerializedItemType.Map,
            entries: Array.from(property.entries())
                .map(([key, value]) => [this._serializeProperty(key), this._serializeProperty(value)]),

        };
    }

    /**
     * Returns the specified item,
     * assuming it is a Set.
     */
    private _serializeItemSet(property: Set<unknown>): SerializedItem {
        return {
            type: SerializedItemType.Set,
            entries: Array.from(property.keys())
                .map((entry) => this._serializeProperty(entry)),
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

        if (property instanceof Date) { return this._serializePropertyDate(property); }

        if (property instanceof RegExp) { return this._serializePropertyRegExp(property); }

        if (typeof property === 'symbol') { return this._serializePropertySymbol(property); }

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
     * assuming it is a Date.
     */
    private _serializePropertyDate(property: Date): SerializedProperty {
        return {
            type: SerializedPropertyType.Date,
            timestamp: property.getTime(),
        };
    }

    /**
     * Returns the specified property,
     * assuming it is a Symbol.
     */
    private _serializePropertySymbol(property: symbol): SerializedProperty {
        const name = this._configuration.symbolToName.get(property);
        if (!name) {
            throw new Error(`Bad serialization: Unrecognized symbol ${property.toString()}.`);
        }
        return {
            type: SerializedPropertyType.Symbol,
            name,
        };
    }

    /**
     * Returns the specified property,
     * assuming it is a reference.
     */
    private _serializePropertyReference(property: SerializableItem): SerializedProperty {
        return {
            type: SerializedPropertyType.Reference,
            id: this._serializeItem(property),
        };
    }

    /**
     * Returns the specified property,
     * assuming it is a regular expression.
     */
    private _serializePropertyRegExp(property: RegExp): SerializedProperty {
        return {
            type: SerializedPropertyType.RegExp,
            source: property.source,
            flags: property.flags,
        };
    }

    /**
     * Serializes the specified item,
     * assuming it is an no update item.
     */
    private _serializePropertyNoUpdate(): SerializedProperty {
        return {
            type: SerializedPropertyType.NoUpdate,
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

    /**
     * Returns the configuration for all the prototypes
     * from which the specified object inherits.
     */
    private _getConfigurationsForPrototype(prototype: any): PrototypeConfiguration<unknown>[] {
        // This will break if anyone ever extends Maps, Sets, or Errors,
        // but none of those should really be getting serialized.
        if (prototype === Object.getPrototypeOf({}) || prototype === null) {
            return [];
        }

        const name = this._getNameOfPrototype(prototype);
        const configuration = this._configuration.prototypeNameToConfiguration.get(name)!;

        return [...this._getConfigurationsForPrototype(Object.getPrototypeOf(prototype)), configuration];
    }

    /**
     * Returns the name of the specified prototype.
     */
    private _getNameOfPrototype(prototype: any): string {
        const name = this._configuration.prototypeToName.get(prototype);
        if (!name) {
            throw new Error(`Bad serialization: Unrecognized prototype ${prototype.constructor.name}`);
        }
        return name;
    }

}
