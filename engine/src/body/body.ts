import type * as matter from 'matter-js';
import type { GameObject } from '../game-object/game-object';
import { Angle, Vector } from '../util/geometry';

/**
 * The key used to update the matter body from the Body.
 */
export const updateBodyFromSelfBodyKey = Symbol('updateBodyFromSelfBodyKey');

/**
 * The key used to update the Body from the matter body.
 */
export const updateSelfFromBodyBodyKey = Symbol('updateSelfFromBodyBodyKey');

/**
 * The key used to call the body initializer.
 */
export const initializeBodyKey = Symbol('initializeBodyKey');

/**
 * The key used to store the GameObject that owns this Body.
 */
export const gameObjectBodyKey = Symbol('gameObjectBodyKey');

/**
 * The key used to access the Body's matter.js body,
 * if it has one.
 */
const bodyKey = Symbol('bodyKey');

/**
 * Represents a physical object,
 * and allows interactions with the physics engine.
 */
export abstract class Body {

    private [gameObjectBodyKey]: GameObject = undefined as any;

    /**
     * The position of this Body.
     */
    public position: Vector = Vector.zero;

    /**
     * The angle of this Body.
     */
    public angle: Angle = Angle.zero;

    /**
     * The velocity with which this Body is moving.
     */
    public velocity: Vector = Vector.zero;

    /**
     * The angular velocity with which this Body is rotating.
     */
    public angularVelocity = 0;

    /**
     * The matter-js body this Body wraps,
     * if it has been initialized yet.
     */
    private [bodyKey]: matter.Body | undefined;

    /**
     * Initializes the matter body in this body,
     * and returns it for convenience.
     */
    private [initializeBodyKey](): matter.Body {
        if (this[bodyKey]) {
            return this[bodyKey]!;
        }

        this[bodyKey] = this.initializeBody();
        return this[bodyKey]!;
    }

    /**
     * Initializes the matter-js body.
     *
     * This can be called multiple times
     * — specifically, after construction
     * or after this _Body_ is deserialized.
     */
    protected abstract initializeBody(): matter.Body;

    /**
     * Updates the actual matter-js body
     * from the state of this Body.
     */
    public [updateBodyFromSelfBodyKey]() {
        const body = this[initializeBodyKey]();

    }

    /**
     * Updates the state of this,
     * from the actual matter-js body.
     */
    public [updateSelfFromBodyBodyKey]() {
        const body = this[initializeBodyKey]();
    }

}
