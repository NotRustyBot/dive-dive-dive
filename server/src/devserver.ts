import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { Drawable, Hitbox, ObjectScope, Sync, Transform } from './registry';
import fileUpload from 'express-fileupload';
import { serverInfo } from './main';
import { serverMode } from '@shared/serverInfo';
import { BaseObject } from '@shared/baseObject';
import { Vector, Vectorlike } from '@shared/types';

export function startDevServer() {
    const assetsPath = "../client/static/assets/";

    const app = express();
    app.use(fileUpload());
    app.use(cors());

    app.get('/dev/save', function (req, res) {
        const data = ObjectScope.network.toDeepSerialisable();
        fs.writeFileSync("persistent.json", JSON.stringify(data));
        res.send("OK");
    });

    app.post('/dev/upload', function (req, res) {
        console.log("processing upload");

        for (const filename in req.files) {
            if (Object.prototype.hasOwnProperty.call(req.files, filename)) {
                let file = req.files[filename] as fileUpload.UploadedFile;
                if (fs.existsSync(assetsPath + file.name)) {
                    console.log("replacing " + file.name);
                } else {
                    console.log("adding " + file.name);
                }
                fs.writeFile(assetsPath + file.name, file.data, () => { });
            }
        }
        res.send();
    });

    app.get('/dev/load', function (req, res) {
        const data = JSON.parse(fs.readFileSync("persistent.json", "utf-8"));
        Sync.localAuthority.clear();
        ObjectScope.network.clear();
        ObjectScope.network = ObjectScope.fromSerialisable(data);
        res.send("OK");
    });

    app.get('/dev/tick', function (req, res) {
        serverInfo.tick = 1;
        res.send("OK");
    });

    app.get('/dev/factories', function (req, res) {
        res.send(JSON.stringify([...factories.keys()]));
    });

    app.get('/dev/spawn/:name/:x/:y', function (req, res) {
        const factory = factories.get(req.params.name);
        factory({ x: parseFloat(req.params.x), y: parseFloat(req.params.y) });
        res.send("OK");
    });

    app.get('/dev/pause', function (req, res) {
        serverInfo.mode = serverMode.pause;
        res.send("OK");
    });

    app.get('/dev/play', function (req, res) {
        serverInfo.mode = serverMode.update;
        res.send("OK");
    });

    app.listen(3001)

    console.log("dev server listening");

}

type factory = (position: Vectorlike) => BaseObject

const factories = new Map<string, factory>();

export function registerFactory(name: string, factory: factory) {
    factories.set(name, factory);
}

registerFactory("terrain", (v) => {
    const terrain = ObjectScope.network.createObject();
    const transform = terrain.addComponent(Transform);
    const drawable = terrain.addComponent(Drawable);
    const hitbox = terrain.addComponent(Hitbox);
    const sync = terrain.addComponent(Sync);
    hitbox.sides = new Vector(220, 220);
    drawable.url = "/assets/terrain.png";
    hitbox.layerId = 0;
    transform.position.set(v.x, v.y);
    sync.authorize([transform]);
    drawable.init();
    hitbox.init();
    sync.init();
    return terrain;
});