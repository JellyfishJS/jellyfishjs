import { game, isServer } from 'jellyfish.js';
import { Camera } from './game-objects/camera';
import { SlipperyClient } from './game-objects/client';
import { SlipperServer } from './game-objects/server';

if (!isServer) {
    (window as any || {}).game = game;
}

game.setCanvasByID('game');

if (isServer) {
    game.createObject(SlipperServer);
} else {
    const camera = game.createObject(Camera);
    game.createObject(SlipperyClient, camera);
}

game.start();
