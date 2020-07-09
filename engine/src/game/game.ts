import uuid = require('uuid');
import { GameLoop } from '../game-loop/game-loop';
import { childrenKey, gameKey, GameObject, idKey, spriteKey } from '../game-object/game-object';
import { Input } from '../input/input';
import { Matter } from '../matter-setup/matter-setup';
import { Client, Server } from '../multiplayer';
import { PIXISetup } from '../pixi-setup/pixi-setup';
import { Serializer } from '../serialization';
import type { PrototypeRegistrationOptions } from '../serialization/serializer-configuration';
import { Sprite } from '../sprite/sprite';
import type { Class } from '../util/class-type';
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
     * Input for this game, contains the current state of the keys in the keyboard and the mouse buttons.
     */
    public readonly input = new Input();

    private _pixiSetup: PIXISetup | undefined;

    private _physicsEngine: Matter.Engine | undefined = Matter?.Engine.create();

    private _serializer: Serializer = new Serializer();

    /**
     * Creates an instance of a specified subclass of GameObject,
     * and adds it to this game.
     *
     * Any arguments after the first are passed to the GameObject subclass's constructor.
     */
    public createObject<
        Subclass extends new (...args: any[]) => GameObject,
    >(
        Class: Subclass,
        ...args: ConstructorParameters<Subclass>
    ): InstanceType<Subclass> {
        const newObject = new Class(...args) as InstanceType<Subclass>;
        newObject[idKey] = uuid();
        newObject[gameKey] = this;

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
        return this.getCanvas()?.height;
    }

    /**
     * Returns the width of the canvas
     */
    public getWidth() {
        return this.getCanvas()?.width;
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
     * Registers the specified class with the serializer.
     *
     * Every class involved in multiplayer should be registered.
     */
    public registerClass<T>(Class: Class<T>, options?: PrototypeRegistrationOptions<T>) {
        this._serializer.registerClass(Class, options);
    }

    /**
     * Registers the specific symbol with the serializer.
     *
     * Every symbol involved in serialization should be registered.
     */
    public registerSymbol(symbol: symbol) {
        this._serializer.registerSymbol(symbol);
    }

    /**
     * Serializes the specified entity.
     */
    public getSerializer(): Serializer {
        return this._serializer;
    }

    /**
     * Initializes the classes used by the engine
     * with the game's serializer.
     */
    private _initializeSerializer() {
        this.registerClass(GameObject, {
            blacklistedKeys: (key, item) => !item.isOwnedByCurrentUser(),
        });
        this.registerSymbol(childrenKey);
        this.registerClass(Server);
        this.registerClass(Client);
        this.registerClass(Vector);

        this.registerClass(Sprite);
        this.registerSymbol(spriteKey);
    }

    /**
     * Begins running the game.
     */
    public start() {
        this._initializeSerializer();

        if (!this._pixiSetup) {
            this._pixiSetup = new PIXISetup();
        }

        this._pixiSetup.onInterval(() => {
            this._gameLoop.runStep(this.input, this._pixiSetup, this._physicsEngine);
        });
    }

}

/**
 * The default game.
 *
 * Use this, unless you need multiple instances.
 */
export const game = new Game();
