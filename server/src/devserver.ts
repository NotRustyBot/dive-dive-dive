import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { ObjectScope, Sync } from './registry';
import fileUpload from 'express-fileupload';
import { serverInfo } from './main';
import { serverMode } from '@shared/serverInfo';

export function startDevServer(){
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
                fs.writeFile(assetsPath + file.name, file.data, ()=>{});
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