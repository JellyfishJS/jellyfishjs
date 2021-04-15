import { game, GameObject, ImageSprite, Vector } from 'engine';

export class Track extends GameObject {

    private readonly position: Vector;

    public constructor(position: Vector) {
        super();
        this.position = position;
    }

    public onCreate() {
        const sprite = this.createSprite(TrackSprite);
        sprite.position = this.position;
    }

}
game.registerClass(Track);

class TrackSprite extends ImageSprite {
    public constructor() {
        super('assets/track.png');
    }

    public initializeSprite(pixi: typeof PIXI, container: PIXI.Container) {
        const sprite = super.initializeSprite(pixi, container);
        sprite.scale.set(4, 4);
        return sprite;
    }
}
game.registerClass(TrackSprite);
