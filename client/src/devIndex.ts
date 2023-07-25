import { ObjectScope } from "@shared/objectScope";
import { BaseObject } from "@shared/baseObject";
import { ServerInfo, serverMode } from "@shared/serverInfo";
console.log("dev enabled");

import html from "./devhtml/screen.html"
document.body.innerHTML = html;


import { app } from "./index";
import { DevAttach } from "./devDebugAttach";

DevAttach.container = app.stage;
DevAttach.init();
DevAttach.toggle("drawDebug", (set?: boolean) => {
    if (set != undefined) DevAttach.drawDebug = set;
    return DevAttach.drawDebug;
});

const baseDebugUrl = "http://" + window.location.hostname + ":3001/dev";
DevAttach.button("saveState", () => {
    fetch(baseDebugUrl + "/save");
});

DevAttach.button("loadState", () => {
    fetch(baseDebugUrl + "/load");
});

DevAttach.button("timeStop", () => {
    if (ServerInfo.get().mode == serverMode.pause) {
        fetch(baseDebugUrl + "/play");
    } else {
        fetch(baseDebugUrl + "/pause");
    }
});

DevAttach.button("timeStep", () => {
    fetch(baseDebugUrl + "/tick");
});


DevAttach.toggle("objectInfo", (set?: boolean) => {
    if (set != undefined) DevAttach.debugInfo = set;
    if (DevAttach.debugInfo) {
        document.getElementsByClassName("dev-information")[0].classList.remove("hidden");
    } else {
        document.getElementsByClassName("dev-information")[0].classList.add("hidden");
    }

    return DevAttach.debugInfo;
});

BaseObject.attach = (baseobject: BaseObject) => {
    DevAttach.attachTo(baseobject);
}


const keys: Record<string, boolean> = {}
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
})

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
})


let scale = 1;
const devCamSpeed = 20;
const pow = 0.1;
setInterval(() => {
    if (keys["+"]) {
        scale *= 1.1;
        app.stage.scale.set(scale);
    }

    if (keys["-"]) {
        scale /= 1.1;
        app.stage.scale.set(scale);
    }

    if (keys["ArrowUp"]) {
        app.stage.position.y += devCamSpeed / scale ** pow;
    }

    if (keys["ArrowDown"]) {
        app.stage.position.y -= devCamSpeed / scale ** pow;
    }

    if (keys["ArrowLeft"]) {
        app.stage.position.x += devCamSpeed / scale ** pow;
    }

    if (keys["ArrowRight"]) {
        app.stage.position.x -= devCamSpeed / scale ** pow;
    }

}, 50)

const debugPort = 3001;
window.addEventListener("keydown", (e) => {
    if (e.key == "F8") {
        e.preventDefault();
        var data = new FormData();
        data.append("content", JSON.stringify(ObjectScope.game.toDeepSerialisable()));
        fetch("http://" + window.location.hostname + ":" + debugPort + "/data", { method: "put", body: data })
    }
});

function startDragDrop() {

    const element = document.getElementById("dropzone");
    if (!element) throw "no #dropzone found";
    element.addEventListener('dragover', (drag) => {
        element.classList.add("drag");
        drag.preventDefault();

    });
    element.addEventListener('dragleave', (drag) => {
        element.classList.remove("drag");
        drag.preventDefault();

    });

    element.addEventListener('drop', (drag) => {
        console.log("drop");
        element.classList.remove("drag");
        drag.preventDefault();
        if (drag.dataTransfer == null) return;

        if (drag.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            [...drag.dataTransfer.items].forEach((item, i) => {
                // If dropped items aren't files, reject them
                if (item.kind === "file") {
                    const file = item.getAsFile();
                    if (file) {
                        uploadFile(file, drag.pageX, drag.pageY);
                    }
                }
            });
        }
    });
}

function uploadFile(file: File, x: number, y: number) {
    let formData = new FormData();
    formData.append(file.name, file);
    fetch(baseDebugUrl + '/upload', { method: "POST", body: formData });
}

startDragDrop();