import type * as Matter from 'matter-js';
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
 * The key used to access the Body's matter.js body,
 * if it has one.
 */
const bodyKey = Symbol('bodyKey');

/**
 * Represents a physical object,
 * and allows interactions with the physics engine.
 */
export abstract class Body {

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
    private [bodyKey]: Matter.Body | undefined;

    /**
     * Initializes the matter-js body.
     *
     * This can be called multiple times
     * — specifically, after construction
     * or after this _Body_ is deserialized.
     */
    public abstract initializeBody(): Matter.Body;

    /**
     * Updates the actual matter-js body
     * from the state of this Body.
     */
    public [updateBodyFromSelfBodyKey]() {
        if (!this[bodyKey]) {
            this[bodyKey] = this.initializeBody();
        }

        // Can be !'d since we set it above.
        const body = this[bodyKey];
    }

    /**
     * Updates the state of this,
     * from the actual matter-js body.
     */
    public [updateSelfFromBodyBodyKey]() {
        const body = this[bodyKey];
        if (!body) { return; }
    }

}
