# Architecture

## `Game`

The `Game` object is in charge of running the entire game.

Usually, there will just be one `Game`.
There can be multiple servers in the same `Game`.
To facilitate the most common use case,
a single `Game` instance,
called `game`,
is exported.

In the rare case when multiple `Game`s are needed,
new game instances can be created.

`Game`s take care of high-level operations,
such as canvas attachments,
determining height,
handling keyboard input,
and so forth.

`Game`s also contain `GameLoop`s,
which are in charge of handling the various events in the game.

## `GameObject`s

Jellyfish games consist of a tree of `GameObject`s.
Each `GameObject` contains a list of its children,
stored under the `childKey` key.

Each of these `GameObject`s has a number of hooks
that are called at various times.

## `GameLoop`

Each `Game` has one `GameLoop`.
The `GameLoop` has a tree of `GameObject`s,
and calls the hooks on the `GameObject`s at the appropriate times.

Hooks are called on game objects
by traversing the tree depth-first,
in order of object creation.
Note the object creation order may be altered
between the server and different clients.

Every step, or 30 times per second,
the following events occur in the following order,
except where otherwise specified:

- `beforeStep`:
    - All the `beforeStep` hooks are called.
- Object creation:
    - Any objects that have been created since last time the step ran
        are added to their parents as children.
    - Then each has `onCreate`, `setUpPhysicsBody`, and `setUpSprite` called.
    - If any more `GameObject`s in these hooks,
        this step is repeated.
    - If this has iterated too many times,
        recursive object creation is noted,
        and this step is aborted until next step.
- Input events:
    - In the order the keys were actually pressed and released,
        `keyPressed` and `keyReleased` hooks are called on all the `GameObject`s.
        Input state is updated to reflect only events
        whose hooks have been called.
    - For any keys that are still held,
        each `GameObject` has its `keyHeld` hook called.
- `beforePhysics`:
    - All the `beforePhysics` hooks are called.
- Physics:
    - The physics engine is advanced one step.
- `afterPhysics`:
    - All the `afterPhysics` hooks are called.
- `step`:
    - All the `step` hooks are called.
- `draw`:
    - If PIXI is available,
        then each `GameObject` that has a sprite and container
        has its `draw` hook called.
- Destruction:
    - Any objects that have been destroyed
        have their `onDestroy` hook called,
        and are removed from their parents.
    - If any objects were destroyed
        during this step,
        it repeats.
- `endStep`:
    - All the `endStep` hooks are called.

## `Server`s and `Client`s

Servers and clients
synchronize everything beneath them
in their `GameObject` tree.
None of their own state is synchronized.
`GameObject`s that exist above them
in the `GameObject` tree
are never synchronized.
