import { assert } from 'chai';
import 'mocha';

import { Angle } from '../../../src';

describe('Angle', function () {

    it('should support radian initialization', function () {
        const radians = 2.31;
        assert.approximately(Angle.radians(radians).radians(), radians, 0.001);
    });

    it('should support degree initialization', function () {
        const degrees = 176;
        assert.approximately(Angle.degrees(degrees).degrees(), degrees, 0.001);
    });

    it('should normalize radians', function () {
        const radians = 1.23;
        assert.approximately(Angle.radians(radians + 16 * Math.PI).radians(), radians, 0.001);
        assert.approximately(Angle.radians(radians - 16 * Math.PI).radians(), radians, 0.001);
        assert.approximately(Angle.radians(-radians + 16 * Math.PI).radians(), -radians, 0.001);
        assert.approximately(Angle.radians(-radians - 16 * Math.PI).radians(), -radians, 0.001);
        assert.approximately(Angle.radians(-Math.PI).radians(), Math.PI, 0.001);
    });

    it('should normalize degrees', function () {
        const degrees = 83;
        assert.approximately(Angle.degrees(degrees + 8 * 360).degrees(), degrees, 0.001);
        assert.approximately(Angle.degrees(degrees - 8 * 360).degrees(), degrees, 0.001);
        assert.approximately(Angle.degrees(-degrees + 8 * 360).degrees(), -degrees, 0.001);
        assert.approximately(Angle.degrees(-degrees - 8 * 360).degrees(), -degrees, 0.001);
        assert.approximately(Angle.degrees(-180).degrees(), 180, 0.001);
    });

    it('should convert from radians to degrees correctly', function () {
        assert.approximately(Angle.degrees(60).radians(), Math.PI / 3, 0.001);
        assert.approximately(Angle.radians(Math.PI / 3).degrees(), 60, 0.001);
    });

    it('should correctly check equality', function () {
        assert.isTrue(Angle.radians(Math.PI / 3).equals(Angle.radians(Math.PI / 3)));
    });

    it('should negate correctly', function () {
        assert.isTrue(Angle.radians(Math.PI).negated().equals(Angle.radians(Math.PI))); // PI is its own negation.
        assert.isTrue(Angle.radians(1.2).negated().equals(Angle.radians(-1.2)));
    });

    it('should add correctly', function () {
        assert.isTrue(Angle.radians(1.3).plus(Angle.radians(1.2)).equals(Angle.radians(2.5)));
    });

    it('should subtract correctly', function () {
        assert.isTrue(Angle.radians(1.3).minus(Angle.radians(1.2)).equals(Angle.radians(0.1)));
    });

});
