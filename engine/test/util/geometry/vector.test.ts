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

    it('should support length', function () {
        assert.approximately(Vector.xy(3, 4).length(), 5, 0.001);
    });

    it('should support direction', function () {
        assert.approximately(Vector.xy(Math.sqrt(3), 1).direction().degrees(), 30, 0.001);
    });

    it('should support new x values', function () {
        assert.isTrue(Vector.xy(3, 5).withX(6).equals(Vector.xy(6, 5)));
    });

    it('should support new y values', function () {
        assert.isTrue(Vector.xy(3, 5).withY(6).equals(Vector.xy(3, 6)));
    });

    it('should support new lengths', function () {
        assert.isTrue(
            Vector.lengthAndDirection(3, Angle.degrees(40))
                .withLength(6)
                .equals(
                    Vector.lengthAndDirection(6, Angle.degrees(40)),
                ),
        );
    });

    it('should support new directions', function () {
        const vector = Vector.lengthAndDirection(3, Angle.degrees(40)).withDirection(Angle.degrees(-30));
        assert.approximately(vector.length(), 3, 0.001);
        assert.approximately(vector.direction().degrees(), -30, 0.001);
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

    it('should support multiplication', function () {
        assert.isTrue(Vector.xy(3, -7).times(3).equals(Vector.xy(9, -21)));
    });

    it('should support division', function () {
        assert.isTrue(Vector.xy(6, -12).dividedBy(3).equals(Vector.xy(2, -4)));
    });

});
