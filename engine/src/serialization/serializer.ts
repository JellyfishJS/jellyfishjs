import { Deserialization } from './deserialization';
import { Serialization } from './serialization';
import { SerializableItem, SerializedEntity } from './serialization-result';
import { SerializerConfiguration } from './serializer-configuration';

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
     * The configuration of this serializer.
     */
    private _configuration = new SerializerConfiguration();

    /**
     * Registers a class to be serializable.
     */
    public registerClass(Class: new () => unknown) {
        this._configuration.registerClass(Class);
    }

}
