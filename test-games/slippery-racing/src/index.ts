import { game } from 'engine';
import { MainObject } from './game-objects/main-object';

game.setCanvasByID('game');
game.createObject(MainObject);
game.start();
