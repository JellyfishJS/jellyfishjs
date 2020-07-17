import { game, GameObject, Sprite, Vector } from 'engine';

const speed = 2;

export class Circle extends GameObject {

    private sprite: CircleSprite = this.createSprite(CircleSprite, Vector.zero);

    public keyHeld(key: number) {
        if (!this.isOwnedByCurrentUser()) { return; }
        switch (key) {
            case 39:
                this.sprite.position = this.sprite.position.plus(Vector.xy(speed, 0));
                break;
            case 37:
                this.sprite.position = this.sprite.position.plus(Vector.xy(-speed, 0));
                break;
            case 40:
                this.sprite.position = this.sprite.position.plus(Vector.xy(0, speed));
                break;
            case 38:
                this.sprite.position = this.sprite.position.plus(Vector.xy(0, -speed));
                break;
        }
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
