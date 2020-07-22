import { Body, GameObject, ImageSprite, Vector } from 'engine';
import { Bodies } from 'matter-js';

export class LooseTire extends GameObject {

    private readonly initialPosition: Vector;
    private readonly radius = 20;
    private sprite!: ImageSprite;
    private body!: Body;

    public constructor(position: Vector) {
        super();
        this.initialPosition = position;
    }

    public onCreate() {
        this.sprite = this.createSprite(ImageSprite, '/assets/tire.png');
        this.body = this.createBody(LooseTireBody, this.initialPosition, this.radius);
        this.sprite.following = this.body;
    }

}

class LooseTireBody extends Body {

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
                frictionAir: 0.01,
                restitution: 0.5,
                density: 0.003,
                inertia: 100,
            },
        );
    }

}
