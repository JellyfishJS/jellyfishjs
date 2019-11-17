import { assert } from 'chai';
import 'mocha';

import { Serializer } from '../../src/serialization';
import { SerializedItemType, SerializedPropertyType } from '../../src/serialization/serialization-result';

describe('Serialization', function () {

    it('should exist', function () {
        assert.exists(Serializer);
    });

    describe('Plain serialization and deserialization', function () {

        function assertSerializesCorrectly(original: any) {
            const serializer = new Serializer();
            const serialized = serializer.serialize(original);
            const deserialized = serializer.deserialize(serialized);
            assert.deepEqual(deserialized, original);
        }

        it('should serialize simple objects', function () {
            assertSerializesCorrectly({ a: { b: { } } });
        });

        it('should serialize simple arrays', function () {
            assertSerializesCorrectly({ a: [{}, 7, 'string', [1, 2], { c: 'c' }] });
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
                    items: {
                        id: {
                            type: SerializedItemType.Object,
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

        it('should serialize the current date', function () {
            assertSerializesCorrectly({ a: new Date() });
        });

        it('should serialize past dates', function () {
            const testDate = new Date();
            // This timestamp is: Sun Nov 17 2019 14:40:45 GMT-0500 (Eastern Standard Time).
            testDate.setTime(1574019645740);
            assertSerializesCorrectly({ a: testDate });
        });

        it('should serialize future dates', function () {
            const testDate = new Date();
            // This timestamp is: Mon Dec 21 2020 14:40:45 GMT-0500 (Eastern Standard Time).
            testDate.setTime(1608579645740);
            assertSerializesCorrectly({ a: testDate });
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

        it('should serialize Maps', function () {
            assertSerializesCorrectly({ a: new Map([[1, 2], [3, 4], [5, 6]]) });
            assertSerializesCorrectly({ a: new Map([[{ a: {} }, []], [[1], { b: { c: {} } }]]) });
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

    describe('Deserializing into existing objects', function () {

        it('should update the passed object', function () {
            const serializer = new Serializer();

            const target: any = {};
            const result: any = { a: 3 };

            const serialization = serializer.serialize(result);
            serializer.deserialize(serialization, target);

            assert.deepEqual(target, result);
        });

        it('should update references in objects', function () {
            const serializer = new Serializer();

            const target: any = { a: {} };
            const mirror: any = target.a;
            const result: any = { a: { b: 3 } };

            const serialization = serializer.serialize(result);
            serializer.deserialize(serialization, target);

            assert.deepEqual(target, result);
            assert.deepEqual(target.a, mirror);
        });

        it('should update the passed array', function () {
            const serializer = new Serializer();

            const target: any = [];
            const result: any = [3];

            const serialization = serializer.serialize(result);
            serializer.deserialize(serialization, target);

            assert.deepEqual(target, result);
        });

        it('should update references in arrays', function () {
            const serializer = new Serializer();

            const target: any = [[]];
            const mirror: any = target[0];
            const result: any = [[3]];

            const serialization = serializer.serialize(result);
            serializer.deserialize(serialization, target);

            assert.deepEqual(target, result);
            assert.deepEqual(target[0], mirror);
        });

        it('should not update objects as arrays', function () {
            const serializer = new Serializer();

            const target: any = { a: {} };
            const result: any = { a: [] };

            const serialization = serializer.serialize(result);
            serializer.deserialize(serialization, target);

            assert.deepEqual(target, result);
        });

    });

});
