import { Angle, Body, game, GameObject, ImageSprite, Sprite, Vector } from 'engine';
import * as keycode from 'keycode';
import { Bodies } from 'matter-js';
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

export class Car extends GameObject {

    private readonly initialPosition: Vector;
    private readonly performance: Performance;
    private readonly camera: Camera;
    private sprite!: ImageSprite;
    private body!: Body;

    public constructor(position: Vector, performance: Performance, camera: Camera) {
        super();
        this.initialPosition = position;
        this.performance = performance;
        this.camera = camera;
    }

    public onCreate() {
        this.sprite = this.createSprite(ImageSprite, '/assets/car.png');
        this.createSprite(SetupSprite);

        this.body = this.createBody(CarBody, this.initialPosition);
        this.camera.setFollowing(this.body);
        this.sprite.following = this.body;
    }

    public beforePhysics() {
        const mainForce = Vector.lengthAndDirection(
            this.performance.acceleration * this.body.mass,
            this.body.angle,
        );

        if (game.input.isDown(keycode('up')) || game.input.isDown(game.input.mouseCode(0))) {
            this.body.applyForce(mainForce);
        }

        if (game.input.isDown(keycode('down')) || game.input.isDown(game.input.mouseCode(2))) {
            this.body.applyForce(mainForce.negated());
        }

        const mainTorque = this.performance.cornering * this.body.inertia;

        if (game.input.isDown(keycode('left'))) {
            this.body.applyTorque(-mainTorque);
        }

        if (game.input.isDown(keycode('right'))) {
            this.body.applyTorque(mainTorque);
        }

        const generalFrictionCoefficient = Math.min(
            0.001 * this.body.mass * this.performance.acceleration / this.performance.topSpeed,
            0.001 * this.body.mass,
        );
        const generalFriction = this.body.velocity.times(-generalFrictionCoefficient);
        this.body.applyForce(generalFriction);

        const rotationalFrictionCoefficient = Math.min(
            0.001 * this.body.inertia * this.performance.cornering / this.performance.spinning,
            0.001 * this.body.inertia,
        );
        const rotationalFriction = this.body.angularVelocity * -rotationalFrictionCoefficient;
        this.body.applyTorque(rotationalFriction);

        const sidewaysFrictionCoefficient = Math.min(
            generalFrictionCoefficient * this.performance.handling,
            0.01,
        );
        const sidewaysVelocity = this.body.velocity
            .projection(Vector.unit(
                this.body.angle.plus(Angle.degrees(90)),
            ));
        const sidewaysFriction = sidewaysVelocity.times(-sidewaysFrictionCoefficient);
        this.body.applyForce(sidewaysFriction);
    }

}
game.registerClass(Car);

class CarBody extends Body {

    private initialPosition: Vector;

    public constructor(initialPosition: Vector) {
        super();
        this.initialPosition = initialPosition;
    }

    public initializeBody() {
        return Bodies.rectangle(
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
    }

}
game.registerClass(CarBody);

class SetupSprite extends Sprite<boolean> {
    public initializeSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const application = game.getPIXIApplication();
        if (application) {
            application.renderer.backgroundColor = 0x4b4e4c;
        }
        container.scale.set(0.5);
        return true;
    }

    public draw(pixi: typeof PIXI, sprite: boolean, container: PIXI.Container) {
        container.scale.set(0.5);
    }
}
game.registerClass(SetupSprite);
