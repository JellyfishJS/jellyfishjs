import * as Engine from 'engine';
import { Circle } from './circle';

export class MainObject extends Engine.GameObject {
    public onCreate() {
        this.createObject(Circle);
    }
}
