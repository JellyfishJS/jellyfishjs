import type { Class } from '../util/class-type';

/**
 * Represents the configuration for a serializer.
 */
export class SerializerConfiguration {

    /**
     * Maps the name of a prototype to a configuration.
     */
    public prototypeNameToConfiguration = new Map<string, PrototypeConfiguration<any>>();

    /**
     * Maps prototype objects to the names of the prototypes.
     */
    public prototypeToName = new WeakMap<{}, string>();

    /**
     * Maps symbols the the names of the symbols.
     */
    public symbolToName = new Map<symbol, string>();

    /**
     * Maps symbol names to symbols.
     */
    public symbolNameToSymbol = new Map<string, symbol>();

    /**
     * Registers a class to be serializable.
     */
    public registerClass<T>(
        Class: Class<T>,
        {
            serializationBlacklistedKeys = [],
            deserializationBlacklistedKeys = [],
        }: PrototypeRegistrationOptions<T> = {},
    ) {
        const { name, prototype } = Class;

        if (this.prototypeNameToConfiguration.has(name)) {
            throw new Error(`Serialization registration error: Duplicate prototype name ${name}`);
        }
        this.prototypeToName.set(prototype, name);

        let serializationBlacklistedKeysConfigValue;
        if (typeof serializationBlacklistedKeys === 'function') {
            serializationBlacklistedKeysConfigValue = serializationBlacklistedKeys;
        } else {
            serializationBlacklistedKeysConfigValue = new Set(serializationBlacklistedKeys);
        }

        let deserializationBlacklistedKeysConfigValue;
        if (typeof deserializationBlacklistedKeys === 'function') {
            deserializationBlacklistedKeysConfigValue = deserializationBlacklistedKeys;
        } else {
            deserializationBlacklistedKeysConfigValue = new Set(deserializationBlacklistedKeys);
        }

        const configuration = {
            prototype,
            serializationBlacklistedKeys: serializationBlacklistedKeysConfigValue,
            deserializationBlacklistedKeys: deserializationBlacklistedKeysConfigValue,
        };

        this.prototypeNameToConfiguration.set(name, configuration);
    }

    /**
     * Registers a symbol to be serializable.
     */
    public registerSymbol(symbol: symbol) {
        const name = symbol.toString();
        if (this.symbolNameToSymbol.has(name)) {
            throw new Error(`Serialization registration error: Duplicate symbol name ${name}`);
        }

        this.symbolNameToSymbol.set(name, symbol);
        this.symbolToName.set(symbol, name);
    }

}

/**
 * A function that returns true if the serialization key should be blacklisted,
 * otherwise false.
 */
type SerializationKeyBlacklistFunction<T> = (key: string | symbol, item: T) => boolean;

/**
 * A function that returns true if the deserialization key should be blacklisted,
 * otherwise false. The item may be undefined.
 */
type DeserializationKeyBlacklistFunction<T> = (key: string | symbol, item: T | undefined) => boolean;

/**
 * Represents settings provided by the developer on how objects
 * of a certain prototype are serialized.
 */
export interface PrototypeRegistrationOptions<T> {
    serializationBlacklistedKeys?: (string | symbol)[] | SerializationKeyBlacklistFunction<T>;
    deserializationBlacklistedKeys?: (string | symbol)[] | DeserializationKeyBlacklistFunction<T>;
}

/**
 * Represents settings for the serialization of some prototype.
 */
export interface PrototypeConfiguration<T> {
    prototype: {};
    serializationBlacklistedKeys?: Set<string | symbol> | SerializationKeyBlacklistFunction<T>;
    deserializationBlacklistedKeys?: Set<string | symbol> | DeserializationKeyBlacklistFunction<T>;
}
