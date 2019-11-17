import { Deserialization } from './deserialization';
import { Serialization } from './serialization';
import { SerializableItem, SerializedEntity } from './serialization-result';

/**
 * Serializes and deserializes entities.
 *
 * Multiple instances can be used with different configuration.
 * Instances can be reused if the configuration will rename the same.
 */
export class Serializer {

    /**
     * Serializes the specified entity.
     */
    public serialize(entity: SerializableItem): SerializedEntity {
        return new Serialization(entity).getSerialization();
    }

    /**
     * Deserializes the specified entity.
     */
    public deserialize(entity: SerializedEntity, toUpdate?: SerializableItem | undefined): SerializableItem {
        return new Deserialization(entity, toUpdate).getDeserialization();
    }

    /**
     * Maps the name of a prototype to a configuration.
     */
    private _prototypeNameToConfiguration = new Map<string, PrototypeConfiguration>();

    /**
     * Maps prototype objects to the names of the prototypes.
     */
    private _prototypeToName = new WeakMap<{}, string>();

    /**
     * Registers a class to be serializable.
     */
    public registerClass(Class: new () => unknown) {
        const { name, prototype } = Class;
        if (this._prototypeNameToConfiguration.has(name)) {
            throw new Error(`Serialization registration error: Duplicate name ${name}`);
        }
        this._prototypeToName.set(prototype, name);

        const configuration = { prototype };

        this._prototypeNameToConfiguration.set(prototype, configuration);
    }

}

interface PrototypeConfiguration {
    prototype: {};
}
