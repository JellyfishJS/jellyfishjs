import { assert } from 'chai';
import 'mocha';

import { Game, game, GameObject } from '../src';

describe('Main exports', function () {

    describe('GameObject', function () {

        it('should be exported', function () {
            assert.exists(GameObject);
        });

    });

    describe('Game', function () {

        it('should be exported', function () {
            assert.exists(Game);
        });

        it('should have a default exported game', function () {
            assert.exists(game);
        });

    });

});
