import { assert } from 'chai';
import 'mocha';

import { Serializer } from '../../src/serialization';

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

});
