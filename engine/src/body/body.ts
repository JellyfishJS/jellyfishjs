import type * as Matter from 'matter-js';

export const beforePhysicsBodyKey = Symbol('beforePhysicsBodyKey');
export const afterPhysicsBodyKey = Symbol('afterPhysicsBodyKey');

const bodyKey = Symbol('bodyKey');

export abstract class Body {

    private [bodyKey]: Matter.Body | undefined;

    public abstract initializeBody(): Matter.Body;

    public [beforePhysicsBodyKey]() {
        if (!this[bodyKey]) {
            this[bodyKey] = this.initializeBody();
        }

        // Can be !'d since we set it above.
        this.beforePhysics(this[bodyKey]!);
    }

    public abstract beforePhysics(body: Matter.Body): void;

    public [afterPhysicsBodyKey]() {
        const body = this[bodyKey];
        if (!body) { return; }
        this.afterPhysics(body);
    }

    public abstract afterPhysics(body: Matter.Body): void;

}
