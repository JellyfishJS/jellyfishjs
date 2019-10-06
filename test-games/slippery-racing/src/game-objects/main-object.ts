import { game, GameObject } from 'engine';
import { Car } from './car';

export class MainObject extends GameObject {

    public onCreate() {
        (game.createObject as any)(
            Car,
            { x: 60, y: 30 },
            {
                topSpeed: 0.01,
                acceleration: 0.0005,
                spinning: 0.01,
                cornering: 0.001,
                handling: 0,
            },
        );
        this.physicsWorld.gravity = { x: 0, y: 0, scale: 0 };
    }

}
