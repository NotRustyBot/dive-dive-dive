import * as PIXI from "pixi.js"
import { ObjectScope } from "@shared/objectScope";

import { Network } from "./network";
import { Layer } from "@shared/physics/chunks";
import { NetManager, headerId } from "@shared/netManager";

const game = ObjectScope.game;
export const app = new PIXI.Application<HTMLCanvasElement>({ backgroundColor: "#112244" });
const terrainLayer = new Layer();


document.body.insertBefore(app.view, document.body.firstChild);
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.position.set(window.innerWidth / 2, window.innerHeight / 2);
}

export const entityLayer = new PIXI.Container();

app.stage.addChild(entityLayer);
window.onresize = resize;
resize();


let accumulator = 0;
let phyTarget = 1 / 20;
app.ticker.add((dt) => {
    const serverInfo = ServerInfo.get() ?? { mode: serverMode.update, tick: 0 };
    accumulator += dt / 60;

    if (serverInfo.tick == 1 && serverInfo.mode == serverMode.pause) {
        accumulator = phyTarget;
        dt = phyTarget;
    }

    if (serverInfo.mode == serverMode.pause) {
        accumulator = phyTarget;
        dt = 0;
    }

    game.fire("input");
    if (serverInfo.tick == 1 || serverInfo.mode == serverMode.update) {
        if (serverInfo.tick == 1) serverInfo.tick = 0;

        while (accumulator >= phyTarget) {
            game.fire("update", 60 * phyTarget);
            game.fire("collisions", 60 * phyTarget);
            game.fire("physics", 60 * phyTarget);
            game.fire("post-collision", 60 * phyTarget);
            accumulator -= phyTarget;
        }
    }

    game.fire("draw", dt);
    Network.sendObjects();
});

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

import { initModules } from "./include"
import { ServerInfo, serverMode } from "@shared/serverInfo";
initModules();
NetManager.identity = "test";
Network.start();