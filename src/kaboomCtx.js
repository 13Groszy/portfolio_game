import kaboom from "kaboom";

export const k = kaboom({
    global: false,
    touchToMouse: true,
    canvas: document.getElementById("game"),
    debug: true, //TODO change to false for production
});