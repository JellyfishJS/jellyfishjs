import uuid = require('uuid/v4');

/**
 * Represents a user in a multiplayer setting.
 *
 * Each user has a unique id.
 */
export class User {

    /**
     * Stores the user's id.
     *
     * Private,
     * so that developers in plain javascript
     * don't try to modify it.
     */
    private readonly _id: string;

    /**
     * Returns this user's id.
     */
    public id() { return this._id; }

    /**
     * Constructs a new user with a unique id.
     */
    public constructor(id: string = uuid()) {
        this._id = id;
    }

}
