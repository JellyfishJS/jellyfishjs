import { game } from 'engine';
import { MainObject } from './main-object';

game.setCanvasByID('game');
game.createObject(MainObject);
game.start();
