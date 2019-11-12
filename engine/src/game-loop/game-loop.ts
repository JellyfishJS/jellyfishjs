import * as MatterType from 'matter-js';
import {
    afterPhysicsKey,
    afterStepKey,
    beforePhysicsKey,
    beforeStepKey,
    childrenKey,
    containerKey,
    drawKey,
    GameObject,
    GameObjectBody,
    GameObjectSprite,
    keyHeldKey,
    keyPressedKey,
    keyReleasedKey,
    onCreateKey,
    onDestroyKey,
    spriteKey,
    stepKey,
    toBeDestroyedKey,
    wasDestroyedKey,
} from '../game-object/game-object';
import { Keyboard, KeyEvent } from '../keyboard/keyboard';
import { Matter } from '../matter-setup/matter-setup';
import { PIXI, PIXISetup } from '../pixi-setup/pixi-setup';
import { asArray } from '../util/as-array';

/**
 * How many times to add the objects that have been created
 * in one game loop.
 *
 * GameObjects may create other GameObjects in their onCreate,
 * so the creation needs to be handled multiple times per loop.
 * However, if this is recursive it will loop forever,
 * so there needs to be some sort of limit.
 */
const maxCreationDepth = 1000;

/**
 * Handles running the game loop over the GameObjects it owns.
 */
export class GameLoop {

    /**
     * An array of the GameObjects that exist in this game loop.
     */
    private _gameObjects: GameObject[] = [];

    /**
     * An array of the GameObjects in this GameLoop
     * that will be created on the next step.
     */
    private _gameObjectsToBeCreated: GameObject[] = [];

    /**
     * A mapping from bodies to GameObjects that exist in this game loop.
     */
    private _bodiesToGameObjects: WeakMap<Matter.Body, GameObject<GameObjectSprite, GameObjectBody>> = new WeakMap();

    /**
     * Adds the specified GameObject to this GameLoop.
     */
    public addGameObject(object: GameObject) {
        this._gameObjectsToBeCreated.push(object);
    }

    /**
     * Runs the function for all children of the game object.
     */
    private _forEachInTree(gameObject: GameObject, callback: (gameObject: GameObject) => void) {
        callback(gameObject);
        gameObject[childrenKey].forEach((child) => this._forEachInTree(child, callback));
    }

    /**
     * Runs the function for each game object recursively.
     */
    private _forEachObject(callback: (gameObject: GameObject) => void) {
        this._gameObjects.forEach((gameObject) => this._forEachInTree(gameObject, callback));
    }

    /**
     * Calls the `beforeStep` hook on every initialized game object.
     */
    private _beforeStep() {
        this._forEachObject((gameObject) => {
            gameObject[beforeStepKey]?.();
            gameObject.beforeStep?.();
        });
    }

    /**
     * Calls the appropriate initializers and sets the appropriate defaults
     * on a new GameObject that is to be added to the game loop.
     */
    private _initializeGameObject<
        Sprite extends GameObjectSprite,
        Body extends GameObjectBody,
        Subclass extends GameObject<Sprite, Body>,
    >(
        gameObject: Subclass,
        pixiSetup: PIXISetup | undefined,
    ) {
        gameObject[onCreateKey]?.();
        gameObject.onCreate?.();

        // Apparently type narrowing doesn't work on imports.
        const matter = Matter;
        if (matter) {
            this._initializeGameObjectPhysics(gameObject, matter);
        }

        if (pixiSetup) {
            this._initializeGameObjectPIXI(gameObject, pixiSetup);
        }
    }

    /**
     * Sets up the parts of the passed GameObject related to physics.
     */
    private _initializeGameObjectPhysics<
        Sprite extends GameObjectSprite,
        Body extends GameObjectBody,
        Subclass extends GameObject<Sprite, Body>,
    >(
        gameObject: Subclass,
        matter: typeof MatterType,
    ) {
        if (!gameObject.setUpPhysicsBody) { return; }

        gameObject.physicsBody = gameObject.setUpPhysicsBody();
        const bodyOrBodies: GameObjectBody = gameObject.physicsBody;

        asArray(bodyOrBodies).forEach((body) => {
            matter.World.addBody(gameObject.physicsWorld, body);
            this._bodiesToGameObjects.set(body, gameObject);
        });
    }

    /**
     * Sets up the PIXI related aspects of the passed game object.
     */
    private _initializeGameObjectPIXI<
        Sprite extends GameObjectSprite,
        Body extends GameObjectBody,
        Subclass extends GameObject<Sprite, Body>,
    >(
        gameObject: Subclass,
        pixiSetup: PIXISetup,
    ) {
        const mainContainer = pixiSetup.getContainer();

        if (!mainContainer || !PIXI) { return; }

        if (!gameObject[containerKey]) {
            gameObject.setContainer(mainContainer);
        }

        const container = gameObject[containerKey];
        if (gameObject.setUpSprite && container) {
            gameObject[spriteKey] = gameObject.setUpSprite(PIXI, container);
        }
    }

    /**
     * Adds all the game objects that have been created the previous loop
     * to the game objects to be handled this loop.
     */
    private _handleCreation(pixiSetup: PIXISetup | undefined) {
        let iterations = 0;

        while (this._gameObjectsToBeCreated.length !== 0 && ++iterations < maxCreationDepth) {
            this._gameObjectsToBeCreated.forEach((gameObject) => {
                const parent = gameObject.parent();
                (parent ? parent[childrenKey] : this._gameObjects).push(gameObject);
            });
            const gameObjectsCreatedThisIteration = this._gameObjectsToBeCreated;
            this._gameObjectsToBeCreated = [];

            gameObjectsCreatedThisIteration
                .forEach((gameObject) => this._initializeGameObject(gameObject, pixiSetup));
        }

        if (iterations === maxCreationDepth) {
            console.error('Recursive object creation detected. Some object is probably creating itself in its `create`.');
        }
    }

    /**
     * Calls the appropriate hook for every game object in the games loops based on the key pressed
     * @param keyCode the keycode of the key of the event
     * @param eventType the type of the keyboard hook to call
     */
    private _dispatchKeyEvent(keyCode: number, eventType: KeyEvent): void {
        switch (eventType) {
            case KeyEvent.Pressed:
                this._forEachObject((gameObject) => {
                    gameObject[keyPressedKey]?.(keyCode);
                    gameObject.keyPressed?.(keyCode);
                });
                break;
            case KeyEvent.Released:
                this._forEachObject((gameObject) => {
                    gameObject[keyReleasedKey]?.(keyCode);
                    gameObject.keyReleased?.(keyCode);
                });
                break;
            case KeyEvent.HeldDown:
                this._forEachObject((gameObject) => {
                    gameObject[keyHeldKey]?.(keyCode);
                    gameObject.keyHeld?.(keyCode);
                });
                break;
        }
    }

    /**
     * Updates the keyboard's state,
     * and calls all keyboard hooks on every initialized game object.
     */
    private _keyboardEvents(keyboard: Keyboard) {
        keyboard.processEvents((keyCode: number, eventType: KeyEvent) => this._dispatchKeyEvent(keyCode, eventType));
    }

    /**
     * Calls the `beforePhysics` hook on every initialized game object.
     */
    private _beforePhysics() {
        this._forEachObject((gameObject) => {
            gameObject[beforePhysicsKey]?.();
            gameObject.beforePhysics?.();
        });
    }

    /**
     * Runs one step of the physics engine.
     */
    private _physics(engine: Matter.Engine | undefined) {
        engine && Matter?.Engine.update(engine);
    }

    /**
     * Calls the `afterPhysics` hook on every initialized game object.
     */
    private _afterPhysics() {
        this._forEachObject((gameObject) => {
            gameObject[afterPhysicsKey]?.();
            gameObject.afterPhysics?.();
        });
    }

    /**
     * Calls the `step` hook on every initialized game object.
     */
    private _step() {
        this._forEachObject((gameObject) => {
            gameObject[stepKey]?.();
            gameObject.step?.();
        });
    }

    /**
     * Calls the `draw` hook on every initialized game object that has a sprite and container
     * if this is running client-side.
     */
    private _draw() {
        // For some reason Typescript doesn't handle type narrowing on imported constants,
        // so it needs to be reassigned.
        const pixi = PIXI;
        if (!pixi) { return; }

        this._forEachObject((gameObject) => {
            const sprite = gameObject[spriteKey];
            const container = gameObject[containerKey];
            if (!sprite || !container) { return; }

            gameObject[drawKey]?.(pixi, sprite, container);
            gameObject.draw?.(pixi, sprite, container);
        });
    }

    /**
     * Cleans up destroyed objects,
     * and calls their `onDestroy` hook.
     */
    private _handleDestruction() {
        while (this._gameObjects.some((gameObject) => gameObject[toBeDestroyedKey])) {
            this._gameObjects = this._gameObjects.filter((gameObject) => {
                if (!gameObject[toBeDestroyedKey]) { return true; }

                gameObject[onDestroyKey]?.();
                gameObject.onDestroy?.();
                gameObject[wasDestroyedKey] = true;

                return false;
            });
        }
    }

    /**
     * Calls the `afterStep` hook on every initialized game object.
     */
    private _endStep() {
        this._forEachObject((gameObject) => {
            gameObject[afterStepKey]?.();
            gameObject.afterStep?.();
        });
    }

    /**
     * Runs a single step.
     *
     * Events happen in this order:
     *  - Every `beforeStep` hook is called.
     *  - Any objects that have been created are initialized, and have their `onCreate` hook called.
     *  - Keyboard events are processed, and keyboard hooks are called in order.
     *  - Every `beforePhysics` hook is called.
     *  - The physics engine's step is run.
     *  - Every `afterPhysics` hook is run.
     *  - Every `step` hook is run.
     *  - If this is client-side, every `draw` hook is run on every game object that has a sprite and container.
     *  - Any game objects that have been destroyed are cleaned up, and have their `onDestroy` hook called.
     *  - Every `afterStep` hook is called.
     */
    public runStep(keyboard: Keyboard, pixiSetup: PIXISetup | undefined, engine: Matter.Engine | undefined) {
        this._beforeStep();
        this._handleCreation(pixiSetup);
        this._keyboardEvents(keyboard);
        this._beforePhysics();
        this._physics(engine);
        this._afterPhysics();
        this._step();
        this._draw();
        this._handleDestruction();
        this._endStep();
    }

}
