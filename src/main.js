// scripts for player, map, and game logic

import { k } from "./kaboomCtx";
import { setCamScale, displayDialogue } from "./utils";
import { dialogueData, scaleFactor, characterSpeed, resources } from "./constants";

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
k.setBackground(k.Color.fromHex("#000000"));

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
      isInDialogue: true,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);
        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            addResources(boundary.name);
            if(boundary.name === "castle"){
                if(resources.crystals >=3 && resources.gold >=5){
                    displayDialogue(
                        `You have collected all the resources!  <a target='_blank' href="https://www.linkedin.com/in/mateusz-daszkiewicz-66371a196/">Tell me about it</a> using secret words 'Robots are cool'.`,
                        () => (player.isInDialogue = false)
                    );

                }else{
                    displayDialogue(
                        `You need to collect more resources to see the hidden message.`,
                        () => (player.isInDialogue = false)
                    );
                }
            }else{
              player.isInDialogue = true;
              displayDialogue(
                dialogueData[boundary.name],
                () => (player.isInDialogue = false)
              );
            }
          });
        }
      }

      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }
  function addResources(boundary){
    switch(boundary) {
      case "crystaldragon":
          resources.crystals += 2;
          break;
      case "crystalmine":
          resources.crystals += 3;
          break;
      case "sharpshooter":
      case "magetower":
      case "golddragon":
          resources.gold += 3;
          break;
      case "fort":
      case "forge":
          resources.shields += 2;
          break;
      case "minotaur":
      case "manticores":
          resources.strength += 2;
          break;
      case "leprechaun":
          resources.luck += 5;
          break;
      case "university":
          resources.strength += 2;
          break;
      case "caffee":
          player.speed = characterSpeed + 30;
          break;
      case "labirynth":
      case "medusa":
        player.speed = characterSpeed - 20;
        break;
      case "sulfur":
          resources.strength += 2;
          break;
      case "brewery":
          resources.luck += 2;
          break;
      case "reddragon":
          resources.shields = 0;
          break;
      default:
          console.log("Invalid boundary");
          break;
  }
  displayResources();
  };
  function displayResources(){
    const resourcesUI = document.querySelector(".resources");

    function getClass(resource, threshold) {
      return resource >= threshold ? 'green' : 'red';
    }

    resourcesUI.innerHTML = `
      <p>Crystals: <span class="${getClass(resources.crystals, 3)}">${resources.crystals}</span></p>
      <p>Gold: <span class="${getClass(resources.gold, 5)}">${resources.gold}</span></p>
      <p>Shields: <span class="${resources.shields >= 4 ? 'gold' : 'red'}">${resources.shields}</span></p>
      <p>Strength: <span>${resources.strength}</span></p>
      <p>Luck: <span>${resources.luck}</span></p>
      <p>Speed: <span class="${player.speed >= 150 ? 'gold' : 'red'}">${player.speed}</span></p>
    `;
  }

  setCamScale(k);

  displayResources();
  displayDialogue(
    `Welcome to my portfolio! Use the arrow keys or click to move around. Interact with the objects to learn more about me.`,
    () => (player.isInDialogue = false)
  );

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  function stopAnims() {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  }
  k.onMouseRelease(stopAnims);

  k.onKeyRelease(() => {
    stopAnims();
  });
  k.onKeyDown((key) => {
    const keyMap = [
      k.isKeyDown("right"),
      k.isKeyDown("left"),
      k.isKeyDown("up"),
      k.isKeyDown("down"),
    ];

    let nbOfKeyPressed = 0;
    for (const key of keyMap) {
      if (key) {
        nbOfKeyPressed++;
      }
    }

    if (nbOfKeyPressed > 1) return;

    if (player.isInDialogue) return;
    if (keyMap[0]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
      return;
    }

    if (keyMap[1]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      player.move(-player.speed, 0);
      return;
    }

    if (keyMap[2]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
      return;
    }

    if (keyMap[3]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });
});

k.go("main");