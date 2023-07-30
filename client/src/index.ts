import * as PIXI from "pixi.js"
import { ObjectScope } from "@shared/objectScope";
import { ScreenFilter } from "./filters/screen/screenFilter";
import { Network } from "./network";
import { Layer } from "@shared/physics/chunks";
import { Camera } from "./camera";
import { initModules } from "./include"
import { ServerInfo, serverMode } from "@shared/serverInfo";
import { SubmarineBehaviour } from "@shared/submarine";
import { SubControl } from "./submarineControl";
import { Vector } from "@shared/types";
import { keys } from "./control";

const game = ObjectScope.game;
export const app = new PIXI.Application<HTMLCanvasElement>({ backgroundColor: "#112244" });
export let currentSubmarine: SubmarineBehaviour;
const terrainLayer = new Layer();


export let time = 0;

document.body.insertBefore(app.view, document.body.firstChild);
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.position.set(window.innerWidth / 2, window.innerHeight / 2);
    realLayer.filterArea.x = Math.floor(0);
    realLayer.filterArea.y = Math.floor(0);
    realLayer.filterArea.width = Math.floor(window.innerWidth);
    realLayer.filterArea.height = Math.floor(window.innerHeight);

    Camera.size.x = window.innerWidth;
    Camera.size.y = window.innerHeight;
}


export const realLayer = new PIXI.Container();
export const entityLayer = new PIXI.Container();
realLayer.addChild(entityLayer);

app.stage.addChild(realLayer);
window.onresize = resize;
realLayer.filterArea = new PIXI.Rectangle();
realLayer.filters = [new ScreenFilter()];
resize();

export const currentSubPos = new Vector();
Camera.scale = 0.5;
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

        time += dt / 60;

        while (accumulator >= phyTarget) {
            game.fire("update", 60 * phyTarget);
            game.fire("collisions", 60 * phyTarget);
            game.fire("physics", 60 * phyTarget);
            game.fire("post-collision", 60 * phyTarget);
            accumulator -= phyTarget;
        }
    }

    if (SubControl.current) {
        const subX = SubControl.current.submarine.parent.position.x;
        const subY = SubControl.current.submarine.parent.position.y;

        currentSubPos.set(subX, subY);
        
        const X = (-subX + Camera.position.x * 8) / 9;
        const Y = (-subY + Camera.position.y * 8) / 9;
        Camera.position.set(X, Y)

    }

    if(keys["+"]){
        Camera.scale *= 0.99;        
    }

    if(keys["-"]){
        Camera.scale /= 0.99;        
    }
    realLayer.scale.set(Camera.scale);
    realLayer.position.set(Camera.position.x * Camera.scale, Camera.position.y * Camera.scale);
    game.fire("draw", dt);
    Network.sendObjects();
});

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});




initModules();
Network.start();