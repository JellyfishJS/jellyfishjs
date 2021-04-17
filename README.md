# Jellyfish

Multiplayer game development made easy.

<div align="center">
    <img src="./docs/assets/jellyfish.png" width=150 />
</div>

Jellyfish is a game engine designed around multiplayer.
We handle networking, sending packets, and updating state,
so you can focus on what you care about —
designing your game.

## Features

- Write your code once,
run the same bundle on the server and the client,
and we take care of the rest.
State is automatically synchronized between clients.

- Supports WebGL rendering
(thanks to [PIXI.js](https://www.pixijs.com/))
and optionally, physics
(thanks to [matter.js](https://brm.io/matter-js/)).

- Supports JavaScript and [TypeScript](https://www.typescriptlang.org/).

- No IDE. You already like your editor,
and we could never compete with it.
Use what you're comfortable with.

- Easy to learn, but powerful.
Jellyfish isn't magic
— it does things automatically when you want,
but let's you control the details when you need.

## Simple Multiplayer Game

```js
const { GameObject, ImageSprite, Vector, Server, Client, isServer, game, serve } = require('jellyfish.js');

class Player extends GameObject {
    onCreate() {
        this.position = Vector.xy(100, 300);
        this.sprite = this.createSprite(ImageSprite, '/assets/player.png');
        this.sprite.following = this;
    }

    keyHeld(keycode) {
        if (!this.isOwnedByCurrentUser()) { return; }

        let movement = Vector.zero;
        switch (keycode) {
            case 40: movement = Vector.up; break;
            case 38: movement = Vector.down; break;
            case 37: movement = Vector.left; break;
            case 39: movement = Vector.right; break;
        }

        this.position = this.position.plus(movement);
    }
}
game.registerClass(Player);

class GameServer extends Server {
    onCreate() { this.start(); }
}

class GameClient extends Client {
    onCreate() { this.connect(); }
    onRegistered() {
        const player = this.createObject(Player);
        player.setOwner(this.user());
    }
}

if (isServer) { game.createObject(GameServer); }
else { game.createObject(GameClient); }

game.setCanvasByID("game");
game.start();
serve();
```

## Getting Started

To get started quickly, check out the [first game guide](./docs/use/articles/making-your-first-game.md).

For more information,
see the rest of [the documentation](https://docs.jellyfishjs.org/).

## Contributing

Ideas? Want to help out? Great!
Make a [new issue](https://github.com/JellyfishJS/jellyfishjs/issues)
or a new [pull request](https://github.com/JellyfishJS/jellyfishjs/pulls).

Check out the [development docs](./docs/development/development.md)
for more information.

## Contact Us

If you have a question,
have general feedback,
want to insult us,
or want to help out,
join our [Discord](https://discord.gg/NYBxGRJfNn)!
