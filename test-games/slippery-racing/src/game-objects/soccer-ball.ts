import { Angle, GameObject, ImageSprite, Vector } from 'engine';
import { Bodies, Body } from 'matter-js';

export class SoccerBall extends GameObject<Body> {

    private readonly initialPosition: Vector;
    private readonly radius = 40;
    private readonly sprite: ImageSprite;

    public constructor(position: Vector) {
        super();
        this.initialPosition = position;
        this.sprite = this.createSprite(ImageSprite, '/assets/ball.png');
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

        this.sprite.following = body;

        return body;
    }

}
