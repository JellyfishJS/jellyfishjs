/**
 * Represents the configuration for a serializer.
 */
export class SerializerConfiguration {

    /**
     * Maps the name of a prototype to a configuration.
     */
    public prototypeNameToConfiguration = new Map<string, PrototypeConfiguration>();

    /**
     * Maps prototype objects to the names of the prototypes.
     */
    public prototypeToName = new WeakMap<{}, string>();

    /**
     * Registers a class to be serializable.
     */
    public registerClass(Class: new () => unknown) {
        const { name, prototype } = Class;
        if (this.prototypeNameToConfiguration.has(name)) {
            throw new Error(`Serialization registration error: Duplicate name ${name}`);
        }
        this.prototypeToName.set(prototype, name);

        const configuration = { prototype };

        this.prototypeNameToConfiguration.set(prototype, configuration);
    }

}

/**
 * Represents settings for the serialization of some prototype.
 */
interface PrototypeConfiguration {
    prototype: {};
}
