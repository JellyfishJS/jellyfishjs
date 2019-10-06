import { assert } from 'chai';
import 'mocha';

import { Angle, Vector } from '../../../src';

describe('Vector', function () {

    it('should support cartesian initialization', function () {
        const x = 12;
        const y = -3.12;
        const vector = Vector.xy(x, y);
        assert.strictEqual(vector.x(), x);
        assert.strictEqual(vector.y(), y);
    });

    it('should support length and direction initialization', function () {
        const vector = Vector.lengthAndDirection(2, Angle.degrees(30));
        assert.approximately(vector.x(), Math.sqrt(3), 0.001);
        assert.approximately(vector.y(), 1, 0.001);
    });

    it('should support unit vectors in arbitrary directions', function () {
        const vector = Vector.unit(Angle.degrees(30));
        assert.approximately(vector.x(), Math.sqrt(3) / 2, 0.001);
        assert.approximately(vector.y(), 1 / 2, 0.001);
    });

    it('should support equality', function () {
        assert.isTrue(Vector.xy(3, -7).equals(Vector.xy(3, -7)));
    });

    it('should support addition', function () {
        assert.isTrue(Vector.xy(3, -7).plus(Vector.xy(5, 4)).equals(Vector.xy(8, -3)));
    });

    it('should support subtraction', function () {
        assert.isTrue(Vector.xy(3, -7).minus(Vector.xy(5, 4)).equals(Vector.xy(-2, -11)));
    });

});
