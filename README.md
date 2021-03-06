Jellyfish is currently in heavy development
and is not yet useful for much.

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

**NOTE:**
This doesn't work yet,
and probably won't till v.0.1.0.

```js
const { GameObject, keys, isServer, Client, Server, game } = require('jellyfish.js');

class Player extends GameObject {

    onCreate() {
        this.position = Vector.xy(0, 0);
        this.sprite = this.createSprite(ImageSprite, '/assets/player.png');
        this.sprite.setFollowing(this);
    }

    keyHeld(keycode) {
        if (!this.isOwnedByCurrentUser()) { return; }
        switch (keycode) {
            case Button.Up: this.y++; break;
            case Button.Down: this.y--; break;
            case Button.Left: this.x--; break;
            case Button.Right: this.x++; break;
        }
    }
}
game.registerClass(Player);

class GameServer extends Server {
    onCreate() { this.start(); }

    onUserJoined(user) {
        const player = this.createObject(Player);
        player.setOwner(user);
    }
}

class GameClient extends Server {
    onCreate() { this.connect(); }
}

if (isServer) { game.createObject(GameServer); }
else { game.createObject(GameClient); }

game.start();
```

## Getting Started

To get started quickly, check out the [quick start guide](./docs/use/articles/quick-start.md).

For more information,
see the rest of [the documentation](./docs/use/use.md).

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
