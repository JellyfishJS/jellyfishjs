import { Angle, game, GameObject, Sprite, Vector } from 'engine';
import * as keycode from 'keycode';
import { Bodies, Body } from 'matter-js';
import { Camera } from './camera';

interface Performance {
    /**
     * How fast the car can go.
     */
    topSpeed: number;
    /**
     * How quickly the car can accelerate.
     */
    acceleration: number;
    /**
     * How fast the car can spin.
     */
    spinning: number;
    /**
     * How fast the car can start spinning.
     */
    cornering: number;
    /**
     * How much the car resists sliding sideways.
     */
    handling: number;
}

export class Car extends GameObject<Body> {

    private readonly initialPosition: Vector;
    private readonly performance: Performance;
    private readonly camera: Camera;

    public constructor(position: Vector, performance: Performance, camera: Camera) {
        super();
        this.initialPosition = position;
        this.performance = performance;
        this.camera = camera;
    }

    public setUpPhysicsBody() {
        const body = Bodies.rectangle(
            this.initialPosition.x(),
            this.initialPosition.y(),
            80,
            32,
            {
                frictionAir: 0, // Friction is handled manually.
                friction: 0.4,
                frictionStatic: 0.4,
                restitution: 0.3,
                angle: Angle.degrees(-90).radians(),
            },
        );
        this.camera.setFollowing(body);

        this.createSprite(CarSprite, body);

        return body;
    }

    public beforePhysics() {
        if (!this.physicsBody) { return; }

        const mainForce = Vector.lengthAndDirection(
            this.performance.acceleration * this.physicsBody.mass,
            Angle.radians(this.physicsBody.angle),
        );

        if (game.input.isDown(keycode('up')) || game.input.isDown(game.input.mouseCode(0))) {
            Body.applyForce(
                this.physicsBody,
                this.physicsBody.position,
                mainForce.object(),
            );
        }

        if (game.input.isDown(keycode('down')) || game.input.isDown(game.input.mouseCode(2))) {
            Body.applyForce(
                this.physicsBody,
                this.physicsBody.position,
                mainForce.negated().object(),
            );
        }

        const mainTorque = this.performance.cornering * this.physicsBody.inertia;

        if (game.input.isDown(keycode('left'))) {
            this.physicsBody.torque -= mainTorque;
        }

        if (game.input.isDown(keycode('right'))) {
            this.physicsBody.torque += mainTorque;
        }

        const generalFrictionCoefficient = Math.min(
            0.001 * this.physicsBody.mass * this.performance.acceleration / this.performance.topSpeed,
            0.001 * this.physicsBody.mass,
        );
        const generalFriction = Vector.object(this.physicsBody.velocity).times(-generalFrictionCoefficient);
        Body.applyForce(
            this.physicsBody,
            this.physicsBody.position,
            generalFriction.object(),
        );

        const rotationalFrictionCoefficient = Math.min(
            0.001 * this.physicsBody.inertia * this.performance.cornering / this.performance.spinning,
            0.001 * this.physicsBody.inertia,
        );
        const rotationalFriction = this.physicsBody.angularVelocity * -rotationalFrictionCoefficient;
        this.physicsBody.torque += rotationalFriction;

        const sidewaysFrictionCoefficient = Math.min(
            generalFrictionCoefficient * this.performance.handling,
            0.01,
        );
        const sidewaysVelocity = Vector.object(this.physicsBody.velocity)
            .projection(Vector.unit(
                Angle.radians(this.physicsBody.angle).plus(Angle.degrees(90)),
            ));
        const sidewaysFriction = sidewaysVelocity.times(-sidewaysFrictionCoefficient);
        Body.applyForce(
            this.physicsBody,
            this.physicsBody.position,
            sidewaysFriction.object(),
        );
    }

}

class CarSprite extends Sprite {
    private physicsBody: Body;

    public constructor(physicsBody: Body) {
        super();
        this.physicsBody = physicsBody;
    }

    public initializeSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = pixi.Sprite.from('./assets/car.png');
        sprite.anchor.set(0.5);
        container.addChild(sprite);
        const application = game.getPIXIApplication();
        if (application) {
            application.renderer.backgroundColor = 0x4b4e4c;
        }
        return sprite;
    }

    public draw(pixi: typeof PIXI, sprite: PIXI.Sprite, container: PIXI.Container) {
        if (!this.physicsBody) { return; }

        container.scale.set(0.5);
        [sprite.x, sprite.y] = [this.physicsBody.position.x, this.physicsBody.position.y];
        sprite.angle = Angle.radians(this.physicsBody.angle).plus(Angle.degrees(90)).degrees();
    }
}
