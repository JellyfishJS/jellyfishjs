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
                    rootItem: 1,
                    items: {
                        1: {
                            type: SerializedItemType.Object,
                            stringKeyedProperties: {
                                a: {
                                    type: SerializedPropertyType.BigInt,
                                    value: '1234567890987654321',
                                },
                            },
                            symbolKeyedProperties: {},
                        },
                    },
                };
                const deserialized: any = serializer.deserialize(serializedValue);

                // Both should round the same way.
                assert.strictEqual(deserialized.a, 1234567890987654321);

            }
        });

        it('should not update noupdate entities, while still updating object entities', function () {

            const serializer = new Serializer();
            // This serialized value has two properties of the root object, item1 and item2,
            // item1 is specified as an object and when deserialized, it's value should be update in the original object
            // whereas item2 is a noupdate and when deserialized, it's should not be updated in the original object.
            const serializedValue: any = {
                rootItem: 1,
                items: {
                    1: {
                        type: 'object',
                        stringKeyedProperties: {
                            item1: {
                                type: 'reference',
                                id: 2,
                            },
                            item2: {
                                type: 'reference',
                                id: 3,
                            },
                        },
                        symbolKeyedProperties: {},
                    },
                    2: {
                        type: SerializedItemType.Object,
                        stringKeyedProperties: {
                            a: 'should-update',
                        },
                        symbolKeyedProperties: {},
                    },
                    3: {
                        type: SerializedItemType.NoUpdate,
                    },
                },
            };

            // Construct the original object.
            const originalEntity: any = {
                item1: { a: 'original-value' },
                item2: { a: 'original-value' },
            };
            // Deserialize serializedValue into the originalEntity.
            const deserialized: any = serializer.deserialize(serializedValue, originalEntity);

            // check that item1 has been updated.
            assert.strictEqual(deserialized.item1.a, 'should-update');
            // check that item2 hasn't been updated.
            assert.strictEqual(deserialized.item2.a, 'original-value');

        });

        it('should serialize the current date', function () {
            assertSerializesCorrectly({ a: new Date() });
        });

        it('should serialize past dates', function () {
            // This timestamp is: Sun Nov 17 2019 14:40:45 GMT-0500 (Eastern Standard Time).
            assertSerializesCorrectly({ a: new Date(1574019645740) });
        });

        it('should serialize future dates', function () {
            // This timestamp is: Tue Nov 09 2049 15:14:09 GMT-0500 (Eastern Standard Time).
            assertSerializesCorrectly({ a: new Date(2520101649755) });
        });

        it('should serialize regular expressions', function () {
            assertSerializesCorrectly({ regex: /a+b/gmi });
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

        it('should serialize Sets', function () {
            assertSerializesCorrectly({ a: new Set([1, 2, 3, 4, 5, 6]) });
            assertSerializesCorrectly({ a: new Set([{}, [], [1], { b: { c: {} } }]) });
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

        describe('split duplicate references', function () {
            it('should split duplicate object references', function () {
                const serializer = new Serializer();

                const a = {};
                const target = { a, b: a };
                const result = { a: { x: 1 }, b: { y: 2 } };

                const serialization = serializer.serialize(result);
                serializer.deserialize(serialization, target);

                assert.deepEqual(target, result);
            });

            it('should split duplicate prototype references', function () {
                const serializer = new Serializer();

                class A {
                    public value: number;
                    public constructor(value: number) {
                        this.value = value;
                    }
                }
                serializer.registerClass(A);

                const a = new A(0);
                const target = { a, b: a };
                const result = { a: new A(1), b: new A(2) };

                const serialization = serializer.serialize(result);
                serializer.deserialize(serialization, target);

                assert.deepEqual(target, result);
            });

            it('should split duplicate array references', function () {
                const serializer = new Serializer();

                const a = [0];
                const target = { a, b: a };
                const result = { a: [1], b: [2] };

                const serialization = serializer.serialize(result);
                serializer.deserialize(serialization, target);

                assert.deepEqual(target, result);
            });

            it('should split duplicate set references', function () {
                const serializer = new Serializer();

                const a = new Set<number>();
                const target = { a, b: a };
                const result = { a: new Set([1]), b: new Set([2]) };

                const serialization = serializer.serialize(result);
                serializer.deserialize(serialization, target);

                assert.deepEqual(target, result);
            });

            it('should split duplicate map references', function () {
                const serializer = new Serializer();

                const a = new Map<number, number>();
                const target = { a, b: a };
                const result = { a: new Map([[1, 1]]), b: new Map([[2, 2]]) };

                const serialization = serializer.serialize(result);
                serializer.deserialize(serialization, target);

                assert.deepEqual(target, result);
            });
        });

    });

    describe('Prototype serialization', function () {

        it('should serialize registered prototypes', function () {
            const serializer = new Serializer();

            class B {}
            serializer.registerClass(B);

            const original: any = new B();
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization);
            assert.deepEqual(deserialization, original);
            assert.strictEqual(Object.getPrototypeOf(deserialization), Object.getPrototypeOf(original));
        });

        it('should serialize replace different prototypes', function () {
            const serializer = new Serializer();

            class B {}
            serializer.registerClass(B);
            class C {}
            serializer.registerClass(C);

            const original: any = { b: new B() };
            const target: any = { b: new C() };
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization, target);
            assert.deepEqual(deserialization, original);
            assert.deepEqual(target, original);
            assert.strictEqual(Object.getPrototypeOf(deserialization.b), Object.getPrototypeOf(original.b));
            assert.strictEqual(Object.getPrototypeOf(target.b), Object.getPrototypeOf(original.b));
        });

    });

    describe('Symbol serialization', function () {

        it('should serialize registered symbols', function () {
            const serializer = new Serializer();

            const b = Symbol('b');
            serializer.registerSymbol(b);

            const original: any = { a: 'a', b };
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization);
            assert.deepEqual(deserialization, original);
        });

        it('should serialize registered symbol keys', function () {
            const serializer = new Serializer();

            const b = Symbol('b');
            serializer.registerSymbol(b);

            const original: any = { a: 'a', [b]: 'b' };
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization);
            assert.deepEqual(deserialization, original);
            assert.deepEqual(deserialization[b as any], original[b]);
        });

        it('should remove missing symbol keys', function () {
            const serializer = new Serializer();

            const b = Symbol('b');
            serializer.registerSymbol(b);

            const c = Symbol('c');
            serializer.registerSymbol(c);

            const original: any = { a: 'a', [b]: 'b' };
            const target: any = { [c]: 'c' };
            const serialization = serializer.serialize(original);
            serializer.deserialize(serialization, target);
            assert.deepEqual(target, original);
            assert.deepEqual(target[b as any], original[b]);
            assert.isUndefined(target[c as any]);
        });

    });

    describe('Serialization key blacklisting', function () {

        it('should omit blacklisted keys', function () {
            const serializer = new Serializer();

            class A {}
            serializer.registerClass(A, {
                serializationBlacklistedKeys: ['key'],
            });

            const original: any = new A();
            original.key = 'value';
            original.key2 = 'value2';
            const target: any = new A();
            target.key = 'otherValue';
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization, target);
            assert.strictEqual(deserialization.key, 'otherValue');
            assert.strictEqual(deserialization.key2, 'value2');
        });

        it('should omit blacklisted keys from a function', function () {
            const serializer = new Serializer();

            class A {}
            serializer.registerClass(A, {
                serializationBlacklistedKeys: (key) => key === 'key',
            });

            const original: any = new A();
            original.key = 'value';
            original.key2 = 'value2';
            const target: any = new A();
            target.key = 'otherValue';
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization, target);
            assert.strictEqual(deserialization.key, 'otherValue');
            assert.strictEqual(deserialization.key2, 'value2');
        });

        it('should pass the relevant item to the blacklist function', function () {
            const serializer = new Serializer();

            class A {}
            serializer.registerClass(A, {
                serializationBlacklistedKeys: (key, item) => (item as any)[key] === 'value',
            });

            const original: any = new A();
            original.key = 'value';
            original.key2 = 'value2';
            const target: any = new A();
            target.key = 'otherValue';
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization, target);
            assert.strictEqual(deserialization.key, 'otherValue');
            assert.strictEqual(deserialization.key2, 'value2');
        });

        it('should omit blacklisted symbol keys', function () {
            const serializer = new Serializer();

            const key = Symbol('key');
            serializer.registerSymbol(key);

            const key2 = Symbol('key2');
            serializer.registerSymbol(key2);

            class A {}
            serializer.registerClass(A, {
                serializationBlacklistedKeys: [key],
            });

            const original: any = new A();
            original[key] = 'value';
            original[key2] = 'value2';
            const target: any = new A();
            target[key] = 'otherValue';
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization, target) as any;
            assert.strictEqual(deserialization[key], 'otherValue');
            assert.strictEqual(deserialization[key2], 'value2');
        });

        it('should omit blacklisted symbol keys from a function', function () {
            const serializer = new Serializer();

            const key = Symbol('key');
            serializer.registerSymbol(key);

            const key2 = Symbol('key2');
            serializer.registerSymbol(key2);

            class A {}
            serializer.registerClass(A, {
                serializationBlacklistedKeys: (k) => k === key,
            });

            const original: any = new A();
            original[key] = 'value';
            original[key2] = 'value2';
            const target: any = new A();
            target[key] = 'otherValue';
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization, target) as any;
            assert.strictEqual(deserialization[key], 'otherValue');
            assert.strictEqual(deserialization[key2], 'value2');
        });

        it('should use superclasses\' configs', function () {
            const serializer = new Serializer();

            class A {}
            serializer.registerClass(A, {
                serializationBlacklistedKeys: (key) => key === 'key',
            });

            class B extends A {}
            serializer.registerClass(B, {
                serializationBlacklistedKeys: (key) => key === 'key2',
            });

            const original: any = new B();
            original.key = 'value';
            original.key2 = 'value2';
            original.key3 = 'value3';
            const target: any = new B();
            target.key = 'otherValue';
            target.key2 = 'otherValue2';
            target.key3 = 'otherValue3';
            const serialization = serializer.serialize(original);
            const deserialization = serializer.deserialize(serialization, target);
            assert.strictEqual(deserialization.key, 'otherValue');
            assert.strictEqual(deserialization.key2, 'otherValue2');
            assert.strictEqual(deserialization.key3, 'value3');
        });

    });

    describe('Deserialization key blacklisting', function () {

        it('should omit blacklisted keys', function () {
            const serializer = new Serializer();

            class A {}
            serializer.registerClass(A, {
                deserializationBlacklistedKeys: (key, item) => key === 'key',
            });

            const original: any = new A();
            original.key = 'value';
            original.key2 = 'value2';
            const target: any = new A();
            target.key = 'otherValue';

            const serialization = serializer.serialize(original);
            // Ensure that the value of original.key stored in our serialization.
            assert.strictEqual((serialization.items[serialization.rootItem] as any).stringKeyedProperties.key, 'value');

            const deserialization = serializer.deserialize(serialization, target);
            assert.strictEqual(deserialization.key, 'otherValue');
            assert.strictEqual(deserialization.key2, 'value2');
        });

        it('should omit blacklisted symbol keys', function () {
            const serializer = new Serializer();

            const key = Symbol('key');
            serializer.registerSymbol(key);

            const key2 = Symbol('key2');
            serializer.registerSymbol(key2);

            class A {}
            serializer.registerClass(A, {
                deserializationBlacklistedKeys: (k, item) => k === key,
            });

            const original: any = new A();
            original[key] = 'value';
            original[key2] = 'value2';
            const target: any = new A();
            target[key] = 'otherValue';

            const serialization = serializer.serialize(original);
            // Ensure that the value of original.key stored in our serialization.
            assert.strictEqual(
                (serialization.items[serialization.rootItem] as any).symbolKeyedProperties['Symbol(key)'],
                'value',
            );

            const deserialization = serializer.deserialize(serialization, target) as any;
            assert.strictEqual(deserialization[key], 'otherValue');
            assert.strictEqual(deserialization[key2], 'value2');
        });

        it('should use superclasses\' configs', function () {
            const serializer = new Serializer();

            class A {}
            serializer.registerClass(A, {
                deserializationBlacklistedKeys: (key, item) => key === 'key',
            });

            class B extends A {}
            serializer.registerClass(B, {
                deserializationBlacklistedKeys: (key, item) => key === 'key2',
            });

            const original: any = new B();
            original.key = 'value';
            original.key2 = 'value2';
            original.key3 = 'value3';
            const target: any = new B();
            target.key = 'otherValue';
            target.key2 = 'otherValue2';
            target.key3 = 'otherValue3';

            const serialization = serializer.serialize(original);
            // Ensure that the value of original.key and original.key2 stored in our serialization.
            const serializedProperties = (serialization.items[serialization.rootItem] as any).stringKeyedProperties;
            assert.strictEqual(serializedProperties.key, 'value');
            assert.strictEqual(serializedProperties.key2, 'value2');

            const deserialization = serializer.deserialize(serialization, target);
            assert.strictEqual(deserialization.key, 'otherValue');
            assert.strictEqual(deserialization.key2, 'otherValue2');
            assert.strictEqual(deserialization.key3, 'value3');
        });

    });

    describe('Serialization item blacklisting', function () {

        [
            { blacklistItem: true, name: 'true', expectValue: 'target', expectType: 'noupdate' },
            { blacklistItem: () => true, name: '() => true', expectValue: 'target', expectType: 'noupdate' },
            { blacklistItem: () => false, name: '() => false', expectValue: 'original', expectType: 'prototyped' },
        ].forEach(({blacklistItem, name, expectValue, expectType}) => {
            it(`should omit all instances when set to ${name}`, function () {
                const serializer = new Serializer();

                class A {}
                serializer.registerClass(A, { blacklistItem });

                const original: any = new A();
                original.key = 'original';

                const target: any = new A();
                target.key = 'target';

                const serialization = serializer.serialize(original);
                assert.strictEqual((serialization.items[serialization.rootItem] as any).type, expectType);

                const deserialization = serializer.deserialize(serialization, target);
                assert.strictEqual(deserialization.key, expectValue);
            });
        });

    });

});
