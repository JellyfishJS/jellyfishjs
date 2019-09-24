import { GameLoop } from '../game-loop/game-loop';
import { GameObject } from '../game-object/game-object';
import { Matter } from '../matter-setup/matter-setup';
import { PIXISetup } from '../pixi-setup/pixi-setup';

/**
 * Represents separate games.
 *
 * Unless you want multiple games running at the same time,
 * use the default `game`.
 */
export class Game {

    /**
     * The GameLoop for this game.
     *
     * Holds the GameObjects and performs appropriate actions on them.
     */
    private readonly _gameLoop = new GameLoop();

    private _pixiSetup: PIXISetup | undefined;

    private _physicsEngine: Matter.Engine | undefined;

    /**
     * Creates an instance of a specified subclass of GameObject,
     * and adds it to this game.
     *
     * Any arguments after the first are passed to the GameObject subclass's constructor.
     */
    public createObject<Subclass extends GameObject, Args extends readonly []>(
        Class: new (...args: Args) => Subclass,
        ...args: Args
    ) {
        const newObject = new Class(...args);

        if (this._physicsEngine) {
            newObject.physicsWorld = this._physicsEngine.world;
        }

        this._gameLoop.addGameObject(newObject);
    }

    /**
     * Sets the canvas on which this game draws to the one with the specified ID.
     */
    public setCanvasByID(id: string) {
        this._pixiSetup = new PIXISetup(id);
    }

    /**
     * Returns the canvas on which this game is drawn.
     */
    public getCanvas() {
        if (!this._pixiSetup) {
            this._pixiSetup = new PIXISetup();
        }

        return this._pixiSetup.getCanvas();
    }

    /**
     * Begins running the game.
     */
    public start() {
        if (!this._pixiSetup) {
            this._pixiSetup = new PIXISetup();
        }

        if (!this._physicsEngine && Matter) {
            this._physicsEngine = Matter.Engine.create();
        }

        this._pixiSetup.onInterval(() => {
            this._gameLoop.runLoop(this._pixiSetup, this._physicsEngine);
        });
    }

}

/**
 * The default game.
 *
 * Use this, unless you need multiple instances.
 */
export const game = new Game();
