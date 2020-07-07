# Architecture

Jellyfish is composed of many smaller,
inter-related pieces.
Not all of them are exposed directly
to the developer,
but understanding them is useful
to understanding the system as a whole,
and important to contributing to Jellyfish.

The components in this document
correspond approximately
with the directory structure of the project.

## `Game`

The `Game` object is in charge of running the entire game.

For most developers, there will just be one `Game`.
To facilitate the most common use case,
a single `Game` instance called `game`,
is also exported.
There can be multiple servers run by the same `Game`.

In the rare case when multiple `Game`s are needed,
new game instances can be created.

`Game`s take care of high-level operations,
such as attaching Jellyfish to the canvas,
and setting the canvas's size.
It also owns the other components,
such as the `Input` class
for handling the keyboard and mouse,
and the `GameLoop` class
for sending the appropriate events
to the `GameObject`s at the appropriate times.

## `GameObject`s

Jellyfish games have a tree of `GameObject`s
Each `GameObject` has some number of children,
each stored by its ID.
Each `GameObject` has at most one parent.

`GameObject`s have a number of hooks
developers can override
to customize behavior at various points in their lifecycle.
Hooks include things like key presses
and the starts of ticks.
A more thorough list of hooks
will be provided in the next section.

## `GameLoop`

Each `Game` has one `GameLoop`.
The `GameLoop` owns the tree of `GameObject`s,
and calls the hooks on the `GameObject`s at the appropriate times.

Hooks are called on game objects
by traversing the tree depth-first,
in order of object creation.
Most hooks are called on the parents first,
except the `afterStep` hook

Every step, or 30 times per second,
the following events occur in the following order,
except where otherwise specified:

- `beforeStep`:
    - All the `beforeStep` hooks are called.
- Object creation:
    - Any objects that have been created since last time the step ran
        are added to their parents as children.
    - Then each has `onCreate`, `setUpPhysicsBody`, and `setUpSprite` called.
    - If any more `GameObject`s were created during these hooks,
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
- `afterStep`:
    - All the `afterStep` hooks are called.

## `Server`s and `Client`s

`Server`s and `Client`s
are two subclasses of `GameObject`.
`Server`s are intended to be instantiated server-side,
and `Client`s are intended to be instantiated client-side.

`Server`s and `Client`s
provide a method to send messages
to each other.
These messages are send to the `onMessage` hook
during the `beforeStep` part of the game loop.

`Server`s and `Client`s
also automatically send the state of the children `GameObject`s
that they own
to each other at the end of every tick.
These are sent as a special type of message.
Upon receiving such a message,
the `Server` or `Client`
updates the state of its children to match.
