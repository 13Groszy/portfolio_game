// scripts for player, map, and game logic

import { k } from "./kaboomCtx";
import { setCamScale, displayDialogue } from "./utils";
import { dialogueData, scaleFactor, characterSpeed } from "./constants";

//player map & position
k.loadSprite("spritesheet", "./player.webp", {
    sliceX: 4,
    sliceY: 2,
    anims: {
      "idle-down": 0,
      "walk-down": { from: 0, to: 1, loop: true, speed: 4 },
      "idle-side": 2,
      "walk-side": { from: 2, to: 3, loop: true, speed: 4 },
      "idle-up": 4,
      "walk-up": { from: 4, to: 5, loop: true, speed: 4 },
    },
  });

//background map
k.loadSprite("map", "./map.webp");

//background color
k.setBackground(k.Color.fromHex("#000"));

k.scene("main", async() => {
     //map data (spawnpoints, boundaries, etc.)
  const mapData = await (await fetch("./portfolio_map.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor*2),
    {
      speed: characterSpeed,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);
});

k.go("main");