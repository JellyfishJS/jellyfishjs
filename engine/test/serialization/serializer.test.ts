import { assert } from 'chai';
import 'mocha';

import { Serializer } from '../../src/serialization';

describe('User', function () {

    it('should exist', function () {
        assert.exists(Serializer);
    });

    it('should serialize things', function () {
        const serializer = new Serializer();
        const original: any = { a: { b: { value: 'wow' } } };
        original.a.b.cycle = original.a;
        const serialized = serializer.serialize(original);
        const deserialized = serializer.deserialize(serialized);

        assert.deepEqual(deserialized, original);
    });

});
