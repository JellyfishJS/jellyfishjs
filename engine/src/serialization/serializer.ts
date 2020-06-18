import { Deserialization } from './deserialization';
import { Serialization } from './serialization';
import type { SerializableItem, SerializedEntity } from './serialization-result';
import { PrototypeRegistrationOptions, SerializerConfiguration } from './serializer-configuration';

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
    public serialize(entity: {}): SerializedEntity {
        return new Serialization(entity as SerializableItem, this._configuration).getSerialization();
    }

    /**
     * Deserializes the specified entity.
     */
    public deserialize(entity: {}, toUpdate?: {} | undefined): SerializableItem {
        return new Deserialization(
            entity as SerializedEntity,
            toUpdate as SerializableItem | undefined,
            this._configuration,
        ).getDeserialization();
    }

    /**
     * The configuration of this serializer.
     */
    private readonly _configuration = new SerializerConfiguration();

    /**
     * Registers a class to be serializable.
     */
    public registerClass<T>(Class: new () => T, options?: PrototypeRegistrationOptions<T>) {
        this._configuration.registerClass(Class, options);
    }

    /**
     * Registers a symbol to be serializable.
     */
    public registerSymbol(symbol: symbol) {
        this._configuration.registerSymbol(symbol);
    }

}
