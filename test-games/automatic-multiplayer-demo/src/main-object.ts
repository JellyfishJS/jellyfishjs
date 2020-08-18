import { GameObject, isServer } from 'engine';
import { Client } from './client';
import { Server } from './server';

export class MainObject extends GameObject {
    public onCreate() {
        if (isServer) {
            this.createObject(Server);
        } else {
            this.createObject(Client);
        }
    }
}
