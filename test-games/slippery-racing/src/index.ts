import { game, isServer } from 'engine';
import { SlipperyClient } from './game-objects/client';
import { SlipperServer } from './game-objects/server';

if (!isServer) {
    (window as any || {}).game = game;
}

game.setCanvasByID('game');

if (isServer) {
    game.createObject(SlipperServer);
} else {
    game.createObject(SlipperyClient);
}

game.start();
