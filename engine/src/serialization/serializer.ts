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

}
