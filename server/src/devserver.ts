import express from "express";
import fs from "fs";
import cors from "cors";
import { Drawable, DynamicHitbox, FishBehaviour, Hitbox, Light, ObjectScope, Physics, PhysicsDrawable, Recharge, Sync, Transform } from "./registry";
import fileUpload from "express-fileupload";
import { clearAll, connector } from "./main";
import { ServerInfo, serverMode } from "@shared/serverInfo";
import { BaseObject } from "@shared/baseObject";
import { Vector, Vectorlike } from "@shared/types";
import { Detectable } from "./server/detectable";
import { RangeDetectable } from "./server/rangeDetectable";
import { Detector } from "./server/detector";
import { drawableExtra } from "@shared/mock/drawable";
import { submarineLayer, terrainLayer } from "@shared/common";
import { Component } from "@shared/component";
import { NetComponent } from "@shared/netComponent";

export function startDevServer() {
    const assetsPath = "../client/static/assets/";

    const app = express();
    app.use(fileUpload());
    app.use(cors());

    app.get("/dev/save", function (req, res) {
        const data = ObjectScope.network.toDeepSerialisable();
        fs.writeFileSync("persistent.json", JSON.stringify(data));
        res.send("OK");
    });

    app.get("/dev/info", function (req, res) {
        res.send(
            JSON.stringify({
                netComponents: Object.entries(Component.componentTypes)
                    .filter(([k, comp]) => comp.prototype instanceof NetComponent)
                    .map(([k, comp]) => ({ typeId: k, name: comp.name })),
            })
        );
    });

    app.post("/dev/upload", function (req, res) {
        console.log("processing upload");

        for (const filename in req.files) {
            if (Object.prototype.hasOwnProperty.call(req.files, filename)) {
                let file = req.files[filename] as fileUpload.UploadedFile;
                if (fs.existsSync(assetsPath + file.name)) {
                    console.log("replacing " + file.name);
                } else {
                    console.log("adding " + file.name);
                }
                fs.writeFile(assetsPath + file.name, file.data, () => {});
            }
        }
        res.send();
    });

    app.get("/dev/load", function (req, res) {
        const data = JSON.parse(fs.readFileSync("persistent.json", "utf8"));
        clearAll();
        ObjectScope.network = ObjectScope.fromSerialisable(data);
        for (const [ws, client] of connector.clients) {
            Detector.subscribeClient(client);
        }
        res.send("OK");
    });

    app.get("/dev/tick", function (req, res) {
        ServerInfo.get().tick = 1;
        res.send("OK");
    });

    app.get("/dev/factories", function (req, res) {
        res.send(JSON.stringify([...factories.keys()]));
    });

    app.get("/dev/spawn/:name/:x/:y", function (req, res) {
        const factory = factories.get(req.params.name);
        factory({ x: parseFloat(req.params.x), y: parseFloat(req.params.y) });
        res.send("OK");
    });

    app.get("/dev/pause", function (req, res) {
        ServerInfo.get().mode = serverMode.pause;
        res.send("OK");
    });

    app.get("/dev/play", function (req, res) {
        ServerInfo.get().mode = serverMode.update;
        res.send("OK");
    });

    app.listen(3001);

    console.log("dev server listening");
}

type factory = (position: Vectorlike) => BaseObject;

const factories = new Map<string, factory>();

export function registerFactory(name: string, factory: factory) {
    factories.set(name, factory);
}

registerFactory("terrain", (v) => {
    const terrain = ObjectScope.game.createObject();
    const transform = terrain.addComponent(Transform);
    const drawable = terrain.addComponent(Drawable);
    const hitbox = terrain.addComponent(Hitbox);
    const sync = terrain.addComponent(Sync);
    const detectable = terrain.addComponent(RangeDetectable);
    hitbox.sides = new Vector(220, 220);
    drawable.url = "/assets/terrain.png";
    drawable.extra = drawableExtra.terrain;
    hitbox.poke = [terrainLayer];
    transform.position.set(v.x, v.y);
    sync.authorize([transform]);
    terrain.initialiseComponents();
    ObjectScope.network.scopeObject(terrain);
    return terrain;
});

registerFactory("terrain2", (v) => {
    const terrain = ObjectScope.game.createObject();
    const transform = terrain.addComponent(Transform);
    const drawable = terrain.addComponent(Drawable);
    const hitbox = terrain.addComponent(Hitbox);
    const sync = terrain.addComponent(Sync);
    const detectable = terrain.addComponent(RangeDetectable);
    hitbox.sides = new Vector(440, 440);
    drawable.url = "/assets/terrain2.png";
    drawable.extra = drawableExtra.terrain;
    hitbox.poke = [terrainLayer];
    transform.position.set(v.x, v.y);
    sync.authorize([transform]);
    terrain.initialiseComponents();
    ObjectScope.network.scopeObject(terrain);
    return terrain;
});

registerFactory("image", (v) => {
    const image = ObjectScope.game.createObject();
    const transform = image.addComponent(Transform);
    const drawable = image.addComponent(Drawable);
    const sync = image.addComponent(Sync);
    const detectable = image.addComponent(RangeDetectable);
    drawable.url = "/assets/red.png";
    drawable.extra = drawableExtra.background;
    transform.position.set(v.x, v.y);
    sync.authorize([transform, drawable]);
    image.initialiseComponents();
    ObjectScope.network.scopeObject(image);
    return image;
});

registerFactory("fish", (v) => {
    const fish = ObjectScope.game.createObject();
    const transform = fish.addComponent(Transform);
    const drawable = fish.addComponent(PhysicsDrawable);
    const glow = fish.addComponent(Light);
    const sync = fish.addComponent(Sync);
    const physics = fish.addComponent(Physics);
    const behaviour = fish.addComponent(FishBehaviour);
    const detectable = fish.addComponent(RangeDetectable);
    const hitbox = fish.addComponent(DynamicHitbox);
    behaviour.physics = physics;
    hitbox.sides = new Vector(22, 22);
    hitbox.peek = [submarineLayer, terrainLayer];
    behaviour.hitbox = hitbox;
    glow.tint = 0x66ff99;
    drawable.url = "/assets/fish.png";
    drawable.physics = physics;
    drawable.extra = drawableExtra.background;
    transform.position.set(v.x, v.y);
    sync.authorize([transform, drawable, behaviour, physics]);
    fish.initialiseComponents();
    ObjectScope.network.scopeObject(fish);
    return fish;
});

registerFactory("grass", (v) => {
    const image = ObjectScope.game.createObject();
    const transform = image.addComponent(Transform);
    const drawable = image.addComponent(Drawable);
    const sync = image.addComponent(Sync);
    const glow1 = image.addComponent(Light);
    const glow2 = image.addComponent(Light);
    const glow3 = image.addComponent(Light);
    const detectable = image.addComponent(RangeDetectable);
    drawable.url = "/assets/grass.png";
    drawable.extra = drawableExtra.background;
    transform.position.set(v.x, v.y);
    glow1.offset.y = -78;
    glow1.offset.x = 5;
    glow1.range = 50;
    glow1.intensity = 1;
    glow1.tint = 0x99ccff;

    glow2.offset.y = -80;
    glow2.offset.x = -30;
    glow2.range = 50;
    glow2.intensity = 1;
    glow2.tint = 0x99ccff;

    glow3.offset.y = -75;
    glow3.offset.x = 45;
    glow3.range = 50;
    glow3.intensity = 1;
    glow3.tint = 0x99ccff;
    sync.authorize([transform, drawable]);
    image.initialiseComponents();
    ObjectScope.network.scopeObject(image);
    return image;
});

registerFactory("recharge", (v) => {
    const recharge = ObjectScope.game.createObject();
    const transform = recharge.addComponent(Transform);
    const drawable = recharge.addComponent(Drawable);
    const sync = recharge.addComponent(Sync);
    const detectable = recharge.addComponent(RangeDetectable);
    const charge = recharge.addComponent(Recharge);
    const hitbox = recharge.addComponent(Hitbox);
    charge.hitbox = hitbox;
    hitbox.peek = [submarineLayer];
    hitbox.sides = new Vector(100, 100);
    drawable.url = "/assets/red.png";
    drawable.extra = drawableExtra.background;
    transform.position.set(v.x, v.y);
    sync.authorize([transform, drawable]);
    recharge.initialiseComponents();
    ObjectScope.network.scopeObject(recharge);
    return recharge;
});
