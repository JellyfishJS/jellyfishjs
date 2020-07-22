import { Body, game, GameObject, ImageSprite, Vector } from 'engine';
import { Bodies } from 'matter-js';

export class SoccerBall extends GameObject {

    private readonly initialPosition: Vector;
    private readonly radius = 40;
    private sprite!: ImageSprite;
    private body!: Body;

    public constructor(position: Vector) {
        super();
        this.initialPosition = position;
    }

    public onCreate() {
        this.sprite = this.createSprite(ImageSprite, '/assets/ball.png');
        this.body = this.createBody(SoccerBallBody, this.initialPosition, this.radius);
        this.sprite.following = this.body;
    }

}
game.registerClass(SoccerBall);

class SoccerBallBody extends Body {

    private initialPosition: Vector;
    private radius: number;

    public constructor(initialPosition: Vector, radius: number) {
        super();
        this.initialPosition = initialPosition;
        this.radius = radius;
    }

    public initializeBody() {
        return Bodies.circle(
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
    }

}
game.registerClass(SoccerBallBody);
