import * as Engine from 'engine';
import { Circle } from './circle';
import { Client } from './client';
import { Server } from './server';

export class MainObject extends Engine.GameObject {
    public onCreate() {
        if (Engine.isServer) {
            this.createObject(Server);
        } else {
            this.createObject(Client);
        }
    }
}
