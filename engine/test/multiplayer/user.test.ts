import { assert } from 'chai';
import 'mocha';

import { User } from '../../src';

describe('User', function () {

    it('should exist', function () {
        assert.exists(User);
    });

    it('should generate unique users', function () {
        // Theoretically this will cause tests to fail every 10 trillion years or so.
        const userA = new User();
        const userB = new User();
        assert.notStrictEqual(userA.id(), userB.id());
    });

});
