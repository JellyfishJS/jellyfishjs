import { assert } from 'chai';
import 'mocha';

import { Serializer } from '../../src/serialization';
import { SerializedItemMetadataType, SerializedPropertyType } from '../../src/serialization/serialization-result';

describe('User', function () {

    it('should exist', function () {
        assert.exists(Serializer);
    });

    function assertSerializesCorrectly(original: any) {
        const serializer = new Serializer();
        const serialized = serializer.serialize(original);
        const deserialized = serializer.deserialize(serialized);
        assert.deepEqual(deserialized, original);
    }

    it('should serialize simple objects', function () {
        assertSerializesCorrectly({ a: { b: { } } });
    });

    it('should serialize numbers', function () {
        assertSerializesCorrectly({ a: 7 });
    });

    it('should serialize BigInts if they are supported', function () {
        // BigInts aren't universally supported yet,
        // and don't have great polyfills,
        // but they will be soon and developers may wish to use them now.
        // This test tests BigInt parsing if BigInts are available,
        // otherwise it tests fallback behaviour.
        // These aren't both testable in the same run,
        // but the integration tests will check both.
        if (typeof BigInt !== 'undefined') {
            assertSerializesCorrectly({ a: BigInt(1234567890987654321) });
        } else {
            const serializer = new Serializer();
            const serializedValue: any = {
                rootItem: 'id',
                objects: {
                    id: {
                        type: SerializedItemMetadataType.Object,
                        stringKeyedProperties: {
                            a: {
                                type: SerializedPropertyType.BigInt,
                                value: '1234567890987654321',
                            },
                        },
                    },
                },
            };
            const deserialized: any = serializer.deserialize(serializedValue);

            // Both should round the same way.
            assert.strictEqual(deserialized.a, 1234567890987654321);

        }
    });

    it('should serialize strings', function () {
        assertSerializesCorrectly({ a: 'string' });
    });

    it('should serialize null', function () {
        assertSerializesCorrectly({ a: null });
    });

    it('should serialize undefined', function () {
        assertSerializesCorrectly({ a: undefined });
    });

    it('should serialize simple arrays', function () {
        assertSerializesCorrectly({ a: [{}, 7, 'string', [1, 2], { c: 'c' }] });
    });

    it('should serialize objects with reference cycles', function () {
        const original: any = { a: { b: { c: 'string' } } };
        original.a.b.cycle = original.a;
        assertSerializesCorrectly(original);
    });

    it('should serialize objects with duplicate references', function () {
        const original: any = { a: { b: { c: 'string' } } };
        original.a.c = original.a.b;
        assertSerializesCorrectly(original);
    });

    it('should serialize arrays with circular references', function () {
        const original: any = [];
        original.push(original);
        assertSerializesCorrectly(original);
    });

    it('should serialize arrays with duplicate references', function () {
        const original: any = [[]];
        original.push(original[0]);
        assertSerializesCorrectly(original);
    });

    it('should ignore functions', function () {
        const original: any = { doThings() {} };

        const serializer = new Serializer();
        const serialized = serializer.serialize(original);
        const deserialized = serializer.deserialize(serialized);
        assert.deepEqual(deserialized, { doThings: undefined });
    });

});
