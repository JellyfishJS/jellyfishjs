/**
 * The type of the class itself.
 *
 * Unfortunately the `new () => T`
 * doesn't work with abstract classes.
 */
interface Class<T> {
    prototype: T;
    name: string;
}

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
            blacklistedKeys = [],
        }: PrototypeRegistrationOptions<T> = {},
    ) {
        const { name, prototype } = Class;

        if (this.prototypeNameToConfiguration.has(name)) {
            throw new Error(`Serialization registration error: Duplicate prototype name ${name}`);
        }
        this.prototypeToName.set(prototype, name);

        let blacklistedKeysConfigValue;
        if (typeof blacklistedKeys === 'function') {
            blacklistedKeysConfigValue = blacklistedKeys;
        } else {
            blacklistedKeysConfigValue = new Set(blacklistedKeys);
        }

        const configuration = {
            prototype,
            blacklistedKeys: blacklistedKeysConfigValue,
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
 * A function that returns true if the key should be blacklisted,
 * otherwise false.
 */
type KeyBlacklistFunction<T> = (key: string | symbol, item: T) => boolean;

/**
 * Represents settings provided by the developer on how objects
 * of a certain prototype are serialized.
 */
export interface PrototypeRegistrationOptions<T> {
    blacklistedKeys?: (string | symbol)[] | KeyBlacklistFunction<T>;
}

/**
 * Represents settings for the serialization of some prototype.
 */
export interface PrototypeConfiguration<T> {
    prototype: {};
    blacklistedKeys?: Set<string | symbol> | KeyBlacklistFunction<T>;
}
