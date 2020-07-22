import { game } from 'engine';
import { SlipperServer } from './game-objects/server';

game.setCanvasByID('game');
game.createObject(SlipperServer);
game.start();
