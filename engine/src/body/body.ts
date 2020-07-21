import type * as matter from 'matter-js';
import type { GameObject } from '../game-object/game-object';
import { Matter } from '../matter-setup/matter-setup';
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

    /**
     * The GameObject that owns this Body.
     */
    private [gameObjectBodyKey]: GameObject = undefined as any;

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
     * Updates the actual matter-js body
     * from the state of this Body.
     */
    public [updateBodyFromSelfBodyKey]() {
        const body = this[initializeBodyKey]();

        const matter = Matter;
        if (!matter) { return; }

        matter.Body.setPosition(body, this.position.object());
        matter.Body.setVelocity(body, this.velocity.object());
        matter.Body.setAngle(body, this.angle.radians());
        matter.Body.setAngularVelocity(body, this.angularVelocity);
    }

    /**
     * Updates the state of this,
     * from the actual matter-js body.
     */
    public [updateSelfFromBodyBodyKey]() {
        const body = this[initializeBodyKey]();

        this.position = Vector.object(body.position);
        this.velocity = Vector.object(body.velocity);
        this.angle = Angle.radians(body.angle);
        this.angularVelocity = body.angularVelocity;
    }

    /**
     * Allows subclasses to interact with the body directly.
     */
    protected withBody(handler: (body: matter.Body) => void) {
        this[updateBodyFromSelfBodyKey]();
        // Can force unwrap this, since the previous method always sets it.
        handler(this[bodyKey]!);
        this[updateSelfFromBodyBodyKey]();
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
     * Applies the specified force to this Body.
     *
     * If an origin is specified,
     * also applies a torque to the body
     * depending on its position and the position of the origin.
     */
    public applyForce(force: Vector, origin?: Vector) {
        const matter = Matter;
        if (!matter) { return; }

        this.withBody((body) => {
            matter.Body.applyForce(body, origin?.object() ?? this.position.object(), force.object());
        });
    }

    /**
     * Applies the specified torque to this Body.
     */
    public applyTorque(torque: number) {
        const matter = Matter;
        if (!matter) { return; }

        this.withBody((body) => {
            body.torque += torque;
        });
    }

}
