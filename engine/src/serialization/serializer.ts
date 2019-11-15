import { Deserialization } from './deserialization';
import { Serialization } from './serialization';
import { SerializableEntity, SerializedEntity } from './serialization-result';

/**
 * Serializes specified objects.
 *
 * Multiple instances can be used to use different configuration.
 */
export class Serializer {

    /**
     * Serializes the specified object.
     */
    public serialize(object: SerializableEntity): SerializedEntity {
        return new Serialization(object).getSerialization();
    }

    public deserialize(object: SerializedEntity): SerializableEntity {
        return new Deserialization(object).getDeserialization();
    }

}
