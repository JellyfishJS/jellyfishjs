# Goals

There are various goals guiding the design of Jellyfish.
It may not meet all of them all the time,
but hopefully it will meet most of them most of the time.

## 1. Write your code once

Developers shouldn't have separate single-player and multiplayer codebases.
Ideally, there shouldn't even be separate server and client bundles.
Instead, they should write their code once and deploy it everywhere.

## 2. Automatic multiplayer

Developers should never have to touch the network.
They should be able to write code like their users are on the same machine,
and Jellyfish should make sure that everything just works.

## 3. Focused on simple, real-time, 2D, multiplayer games

Browser based games aren't the most performant,
so Jellyfish will never be a good engine for computation-intensive games.

The synchronization engine is built around real-time synchronization.
It will work for turn-based games,
but isn't really needed for them.

3D is hard to make performant in web-engines,
so Jellyfish focuses on 2D games.
3D games are possible, though.

Jellyfish focuses on making writing multiplayer like writing single-player.
This means it needs to make writing single-player easy,
but this is a side effect and not the main purpose of Jellyfish.

## 4. Appeal to small teams and hobbyists

Jellyfish isn't targeted at big game development studios.
They have the manpower to do multiplayer from scratch,
and tailor it to their needs to improve efficiency.

Jellyfish is for small teams and hobbyists
who want to be able to focus on game design and functionality
over the fine optimizations and networking details.

## 5. Easy to learn

Jellyfish should be easy to learn.
Jellyfish should make it simple to do simple things,
and shouldn't make it harder to do complex things.

## 6. Hard to do the wrong thing

Things that are wrong should be obviously wrong
— developers shouldn't need to be intimately familiar with Jellyfish
to avoid making critical mistakes.

## 7. Transferrable knowledge

Jellyfish shouldn't require the users to learn Jellyfish-specific things
if it doesn't have to.
It uses JavaScript and TypeScript instead of its own language.
It works with any IDE instead of its own.
It works with regular JavaScript
instead of requiring users to write everything in a Jellyfish specific way.
