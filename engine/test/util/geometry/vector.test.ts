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

});
