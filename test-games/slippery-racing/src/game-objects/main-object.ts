import { game, GameObject } from 'engine';
import { Car } from './car';

export class MainObject extends GameObject {
    public onCreate() {
        (game.createObject as any)(Car, { x: 60, y: 30 });
    }
}
