import { Angle, GameObject, Vector } from 'engine';
import { Bodies, Body } from 'matter-js';

export class SoccerBall extends GameObject<PIXI.Sprite, Body> {

    private readonly initialPosition: Vector;
    private readonly radius = 40;

    public constructor(position: Vector) {
        super();
        this.initialPosition = position;
    }

    public setUpPhysicsBody() {
        const body = Bodies.circle(
            this.initialPosition.x(),
            this.initialPosition.y(),
            this.radius,
            {
                frictionAir: 0.008,
                restitution: 0.9,
                density: 0.0001,
                inertia: 100,
            },
        );
        return body;
    }

    public setUpSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = pixi.Sprite.from('./assets/ball.png');
        sprite.anchor.set(0.5);
        container.addChild(sprite);
        return sprite;
    }

    public draw(pixi: typeof PIXI, sprite: PIXI.Sprite) {
        if (!this.physicsBody) { return; }

        [sprite.x, sprite.y] = [this.physicsBody.position.x, this.physicsBody.position.y];
        sprite.angle = Angle.radians(this.physicsBody.angle).degrees();
    }

}
