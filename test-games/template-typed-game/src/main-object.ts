import { GameObject } from 'engine';

export class MainObject extends GameObject {
    public step() {
        console.log('Running');
    }
}
