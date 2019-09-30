import { game, GameObject } from 'engine';
import { Car } from './car';

export class MainObject extends GameObject {

    public onCreate() {
        (game.createObject as any)(Car, { x: 60, y: 30 });
        this.physicsWorld.gravity = { x: 0, y: 0, scale: 0 };
    }

}
