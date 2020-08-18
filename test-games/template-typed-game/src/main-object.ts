import * as Engine from 'engine';

export class MainObject extends Engine.GameObject {
    public step() {
        console.log('Running');
    }
}
