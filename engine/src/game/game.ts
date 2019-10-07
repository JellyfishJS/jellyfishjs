import { GameLoop } from '../game-loop/game-loop';
import { GameObject } from '../game-object/game-object';
import { Keyboard } from '../keyboard/keyboard';
import { Matter } from '../matter-setup/matter-setup';
import { PIXISetup } from '../pixi-setup/pixi-setup';
import { Vector } from '../util/geometry';

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

    /**
     * Keyboard for this game, contains the current state of the keys in the keyboard.
     */
    public readonly keyboard = new Keyboard();

    private _pixiSetup: PIXISetup | undefined;

    private _physicsEngine: Matter.Engine | undefined = Matter && Matter.Engine.create();

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
        return newObject;
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
     * Returns the PIXI application.
     */
    public getPIXIApplication() {
        if (!this._pixiSetup) {
            this._pixiSetup = new PIXISetup();
        }

        return this._pixiSetup.getApplication();
    }

    /**
     * Returns the height of the canvas
     */
    public getHeight() {
        const canvas = this.getCanvas();
        return canvas && canvas.height;
    }

    /**
     * Returns the width of the canvas
     */
    public getWidth() {
        const canvas = this.getCanvas();
        return canvas && canvas.width;
    }

    /**
     * Returns a vector containing the height and width of the canvas.
     * The x coordinate of the vector is the width, the y coordinate of the vector
     * is the height.
     */
    public getSize() {
        const canvas = this.getCanvas();
        return canvas && Vector.xy(canvas.width, canvas.height);
    }

    /**
     * Begins running the game.
     */
    public start() {
        if (!this._pixiSetup) {
            this._pixiSetup = new PIXISetup();
        }

        this._pixiSetup.onInterval(() => {
            this._gameLoop.runLoop(this.keyboard, this._pixiSetup, this._physicsEngine);
        });
    }

}

/**
 * The default game.
 *
 * Use this, unless you need multiple instances.
 */
export const game = new Game();
