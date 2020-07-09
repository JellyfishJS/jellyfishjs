import { Angle, GameObject, ImageSprite, Sprite, Vector } from 'engine';
import { Bodies, Body } from 'matter-js';

export class LooseTire extends GameObject<Body> {

    private readonly initialPosition: Vector;
    private readonly radius = 20;
    private readonly sprite: ImageSprite;

    public constructor(position: Vector) {
        super();
        this.initialPosition = position;
        this.sprite = this.createSprite(ImageSprite, '/assets/tire.png');
    }

    public setUpPhysicsBody() {
        const body = Bodies.circle(
            this.initialPosition.x(),
            this.initialPosition.y(),
            this.radius,
            {
                frictionAir: 0.01,
                restitution: 0.5,
                density: 0.003,
                inertia: 100,
            },
        );

        this.sprite.body = body;

        return body;
    }

}
