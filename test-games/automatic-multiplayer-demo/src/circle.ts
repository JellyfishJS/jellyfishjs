import { game, GameObject, Sprite, Vector } from 'engine';

export class Circle extends GameObject {

    private sprite: CircleSprite = this.createSprite(CircleSprite, Vector.zero);

    public step() {
        this.sprite.position = this.sprite.position.plus(Vector.xy(0.15, 0.1));
        console.log(this.sprite.position);
    }
}
game.registerClass(Circle);

export class CircleSprite extends Sprite<PIXI.Graphics> {

    public position: Vector;

    public constructor(position: Vector) {
        super();
        this.position = position;
    }

    public initializeSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = new pixi.Graphics();
        container.addChild(sprite);
        return sprite;
    }

    public draw(pixi: typeof PIXI, sprite: PIXI.Graphics) {
        sprite.clear();
        sprite.beginFill(0xaaaaaa);
        sprite.drawCircle(this.position.x(), this.position.y(), 10);
    }

}
game.registerClass(CircleSprite);
