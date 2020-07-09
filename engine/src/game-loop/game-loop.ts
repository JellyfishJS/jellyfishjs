import type * as MatterType from 'matter-js';
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
    idKey,
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
import { ButtonEvent , Input } from '../input/input';
import { Matter } from '../matter-setup/matter-setup';
import { PIXI, PIXISetup } from '../pixi-setup/pixi-setup';
import { asArray } from '../util/as-array';
import { someValue } from '../util/map';

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
    private _gameObjects: Map<string, GameObject> = new Map<string, GameObject>();

    /**
     * An array of the GameObjects in this GameLoop
     * that will be created on the next step.
     */
    private _gameObjectsToBeCreated: GameObject[] = [];

    /**
     * A mapping from bodies to GameObjects that exist in this game loop.
     */
    private _bodiesToGameObjects: WeakMap<Matter.Body, GameObject<GameObjectBody>> = new WeakMap();

    /**
     * Adds the specified GameObject to this GameLoop.
     */
    public addGameObject(object: GameObject) {
        this._gameObjectsToBeCreated.push(object);
    }

    /**
     * Runs the function for all children of the game object.
     */
    private _forEachInTree(
        container: Map<string, GameObject>, gameObject: GameObject,
        callback: (gameObject: GameObject, container: Map<string, GameObject>) => void,
        parentFirst: boolean,
    ) {
        if (parentFirst) {
            callback(gameObject, container);
        }
        gameObject[childrenKey].forEach(
            (child) => this._forEachInTree(gameObject[childrenKey], child, callback, parentFirst));
        if (!parentFirst) {
            callback(gameObject, container);
        }
    }

    /**
     * Runs the function for each game object recursively.
     */
    private _forEachObject(
        callback: (gameObject: GameObject, container: Map<string, GameObject>) => void,
        parentFirst: boolean = true,
    ) {
        this._gameObjects.forEach(
            (gameObject) => this._forEachInTree(this._gameObjects, gameObject, callback, parentFirst));
    }

    /**
     * Returns true if some object in the tree matches the predicate.
     */
    private _someInTree(gameObject: GameObject, callback: (gameObject: GameObject) => boolean): boolean {
        return callback(gameObject) ||
            someValue(gameObject[childrenKey], (gameObject) => this._someInTree(gameObject, callback));
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
        Body extends GameObjectBody,
        Subclass extends GameObject<Body>,
    >(
        gameObject: Subclass,
    ) {
        gameObject[onCreateKey]?.();
        gameObject.onCreate?.();

        // Apparently type narrowing doesn't work on imports.
        const matter = Matter;
        if (matter) {
            this._initializeGameObjectPhysics(gameObject, matter);
        }
    }

    /**
     * Sets up the parts of the passed GameObject related to physics.
     */
    private _initializeGameObjectPhysics<
        Body extends GameObjectBody,
        Subclass extends GameObject<Body>,
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
     * Adds all the game objects that have been created the previous loop
     * to the game objects to be handled this loop.
     */
    private _handleCreation() {
        let iterations = 0;

        while (this._gameObjectsToBeCreated.length !== 0 && ++iterations < maxCreationDepth) {
            this._gameObjectsToBeCreated.forEach((gameObject) => {
                const parent = gameObject.parent();
                (parent ? parent[childrenKey] : this._gameObjects).set(gameObject.id(), gameObject);
            });
            const gameObjectsCreatedThisIteration = this._gameObjectsToBeCreated;
            this._gameObjectsToBeCreated = [];

            gameObjectsCreatedThisIteration
                .forEach((gameObject) => this._initializeGameObject(gameObject));
        }

        if (iterations === maxCreationDepth) {
            console.error('Recursive object creation detected. Some object is probably creating itself in its `create`.');
        }
    }

    /**
     * Calls the appropriate hook for every game object in the games loops based on the input button pressed
     * @param inputCode the code of the key or mouse button of the event
     * @param eventType the type of the input hook to call
     */
    private _dispatchInputEvent(inputCode: number, eventType: ButtonEvent): void {
        switch (eventType) {
            case ButtonEvent.Pressed:
                this._forEachObject((gameObject) => {
                    gameObject[keyPressedKey]?.(inputCode);
                    gameObject.keyPressed?.(inputCode);
                });
                break;
            case ButtonEvent.Released:
                this._forEachObject((gameObject) => {
                    gameObject[keyReleasedKey]?.(inputCode);
                    gameObject.keyReleased?.(inputCode);
                });
                break;
            case ButtonEvent.HeldDown:
                this._forEachObject((gameObject) => {
                    gameObject[keyHeldKey]?.(inputCode);
                    gameObject.keyHeld?.(inputCode);
                });
                break;
        }
    }

    /**
     * Updates the input's state,
     * and calls all input hooks on every initialized game object.
     */
    private _inputEvents(input: Input) {
        input.processEvents((inputCode: number, eventType: ButtonEvent) =>
            this._dispatchInputEvent(inputCode, eventType));
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

        const collides = (gameObjectA: GameObject, gameObjectB: GameObject) => {
            if (gameObjectB === gameObjectA) {
                return false;
            }
            return asArray(gameObjectA.physicsBody).some((bodyA) => {
                // @ts-ignore Query.collides exist, but @types/matter-js is out of date
                const collisions = Matter && Matter.Query.collides(bodyA, asArray(gameObjectB.physicsBody));
                return collisions.length > 0;
            });
        };

        this._gameObjects.forEach((gameObjectA) => {
            this._gameObjects.forEach((gameObjectB) => {
                if (gameObjectB === gameObjectA) {
                    return;
                }
                if (collides(gameObjectA, gameObjectB)) {
                    gameObjectA.onCollision && gameObjectA.onCollision(gameObjectB);
                    gameObjectB.onCollision && gameObjectB.onCollision(gameObjectA);
                }
            });
        });
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
    private _draw(pixiSetup: PIXISetup | undefined) {
        if (!pixiSetup) { return; }

        // For some reason Typescript doesn't handle type narrowing on imported constants,
        // so it needs to be reassigned.
        const pixi = PIXI;
        if (!pixi) { return; }

        this._forEachObject((gameObject) => {
            const sprite = gameObject[spriteKey];
            const container = pixiSetup.getContainer();
            if (!sprite || !container) { return; }

            gameObject[drawKey]?.(pixi, container);
        });
    }

    /**
     * Cleans up destroyed objects,
     * and calls their `onDestroy` hook.
     */
    private _handleDestruction() {
        while (
            someValue(
                this._gameObjects,
                (gameObject) => this._someInTree(gameObject, (gameObject) => gameObject[toBeDestroyedKey]),
            )
        ) {
            this._forEachObject((gameObject, container) => {
                if (gameObject[toBeDestroyedKey]) {
                    gameObject[onDestroyKey]?.();
                    gameObject.onDestroy?.();
                    gameObject[wasDestroyedKey] = true;
                    container.delete(gameObject[idKey]);
                }
            });
        }
    }

    /**
     * Calls the `afterStep` hook on every initialized game object.
     */
    private _afterStep() {
        this._forEachObject(
            (gameObject) => {
                gameObject[afterStepKey]?.();
                gameObject.afterStep?.();
            },
            false,
        );
    }

    /**
     * Runs a single step.
     *
     * Events happen in this order:
     *  - Every `beforeStep` hook is called.
     *  - Any objects that have been created are initialized, and have their `onCreate` hook called.
     *  - Input events are processed, and input hooks are called in order.
     *  - Every `beforePhysics` hook is called.
     *  - The physics engine's step is run.
     *  - Every `afterPhysics` hook is run.
     *  - Every `step` hook is run.
     *  - If this is client-side, every `draw` hook is run on every game object that has a sprite and container.
     *  - Any game objects that have been destroyed are cleaned up, and have their `onDestroy` hook called.
     *  - Every `afterStep` hook is called.
     */
    public runStep(input: Input, pixiSetup: PIXISetup | undefined, engine: Matter.Engine | undefined) {
        this._beforeStep();
        this._handleCreation();
        this._inputEvents(input);
        this._beforePhysics();
        this._physics(engine);
        this._afterPhysics();
        this._step();
        this._draw(pixiSetup);
        this._handleDestruction();
        this._afterStep();
    }

}
